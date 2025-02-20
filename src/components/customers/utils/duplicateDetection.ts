import { supabase } from "@/integrations/supabase/client";
import type { Customer } from "../types/customer";

export interface DuplicateMatch {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  similarity: number;
  match_reason: string[];
}

// Function to normalize phone numbers for comparison
function normalizePhoneNumber(phone: string | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-8); // Keep last 8 digits
}

// Function to normalize names for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to calculate name parts similarity
function calculateNamePartsSimilarity(name1: string, name2: string): number {
  const parts1 = normalizeName(name1).split(' ');
  const parts2 = normalizeName(name2).split(' ');
  
  let matchCount = 0;
  const totalParts = Math.max(parts1.length, parts2.length);

  // Check each part of name1 against all parts of name2
  parts1.forEach(part1 => {
    if (parts2.some(part2 => {
      // Check for exact match or high similarity
      if (part1 === part2) return true;
      if (part1.length > 3 && part2.length > 3) {
        // For longer name parts, check if one contains the other
        if (part1.includes(part2) || part2.includes(part1)) return true;
        // Check for common typos and character swaps
        if (levenshteinDistance(part1, part2) <= 2) return true;
      }
      return false;
    })) {
      matchCount++;
    }
  });

  return matchCount / totalParts;
}

// Levenshtein distance for string similarity
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return track[str2.length][str1.length];
}

// Function to get metaphone representation of a string
function metaphone(str: string): string {
  // Simple metaphone implementation
  return str
    .toLowerCase()
    .replace(/[aeiou]/g, '') // Remove vowels
    .replace(/ph/g, 'f')
    .replace(/[wy]/g, '') // Remove w, y
    .replace(/([^c])[h]/g, '$1') // Remove h unless after c
    .replace(/c[k]/g, 'k')
    .replace(/[dg]ge/g, 'je')
    .replace(/([^p][^h])[gh]/g, '$1'); // Remove gh unless after p or before h
}

export async function findPotentialDuplicates(
  customer: Partial<Customer>
): Promise<DuplicateMatch[]> {
  if (!customer.full_name && !customer.phone_number && !customer.email) {
    return [];
  }

  const matches: DuplicateMatch[] = [];
  const seenIds = new Set<string>();

  // 1. Exact phone number match
  if (customer.phone_number) {
    const normalizedPhone = normalizePhoneNumber(customer.phone_number);
    const { data: phoneMatches } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, email')
      .neq('id', customer.id || '')
      .limit(5);

    if (phoneMatches) {
      phoneMatches.forEach(match => {
        const normalizedMatchPhone = normalizePhoneNumber(match.phone_number);
        if (normalizedMatchPhone === normalizedPhone) {
          matches.push({
            ...match,
            similarity: 1,
            match_reason: ['Exact phone number match']
          });
          seenIds.add(match.id);
        }
        // Partial phone number match (last 6 digits)
        else if (normalizedMatchPhone.slice(-6) === normalizedPhone.slice(-6)) {
          matches.push({
            ...match,
            similarity: 0.8,
            match_reason: ['Similar phone number']
          });
          seenIds.add(match.id);
        }
      });
    }
  }

  // 2. Name matching with multiple algorithms
  if (customer.full_name) {
    const normalizedName = normalizeName(customer.full_name);
    const nameMetaphone = metaphone(normalizedName);

    // Get potential name matches using fuzzy matching
    const { data: nameMatches } = await supabase
      .rpc('fuzzy_name_match', {
        search_name: customer.full_name
      });

    if (nameMatches) {
      nameMatches.forEach(match => {
        if (!seenIds.has(match.id)) {
          const nameSimilarity = calculateNamePartsSimilarity(
            customer.full_name!,
            match.full_name
          );
          
          const matchMetaphone = metaphone(match.full_name);
          const phoneticMatch = nameMetaphone === matchMetaphone;

          if (nameSimilarity > 0.7 || phoneticMatch) {
            matches.push({
              ...match,
              phone_number: null,
              email: null,
              similarity: Math.max(nameSimilarity, phoneticMatch ? 0.9 : 0),
              match_reason: [
                ...(nameSimilarity > 0.7 ? ['Similar name parts'] : []),
                ...(phoneticMatch ? ['Similar sounding name'] : [])
              ]
            });
            seenIds.add(match.id);
          }
        }
      });
    }
  }

  // 3. Email matching with domain check
  if (customer.email) {
    const { data: emailMatches } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, email')
      .neq('id', customer.id || '')
      .limit(5);

    if (emailMatches) {
      emailMatches.forEach(match => {
        if (!seenIds.has(match.id) && match.email) {
          const [customerLocal, customerDomain] = customer.email!.split('@');
          const [matchLocal, matchDomain] = match.email.split('@');

          // Exact email match
          if (customer.email === match.email) {
            matches.push({
              ...match,
              similarity: 1,
              match_reason: ['Exact email match']
            });
            seenIds.add(match.id);
          }
          // Same domain and similar local part
          else if (
            customerDomain === matchDomain &&
            levenshteinDistance(customerLocal, matchLocal) <= 3
          ) {
            matches.push({
              ...match,
              similarity: 0.7,
              match_reason: ['Similar email address']
            });
            seenIds.add(match.id);
          }
        }
      });
    }
  }

  // Sort matches by similarity score and return top 5
  return matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

interface BulkDuplicateResult {
  clusters: Array<{
    customers: DuplicateMatch[];
    similarity: number;
    match_reasons: string[];
  }>;
  totalDuplicates: number;
  processedCount: number;
}

export async function findBulkDuplicates(
  customers: Partial<Customer>[],
  similarityThreshold: number = 0.7
): Promise<BulkDuplicateResult> {
  const clusters: Array<{
    customers: DuplicateMatch[];
    similarity: number;
    match_reasons: string[];
  }> = [];

  const processedIds = new Set<string>();
  let totalDuplicates = 0;

  // Process customers in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < customers.length; i += batchSize) {
    const batch = customers.slice(i, i + batchSize);
    
    // Create a map of normalized phones to customers for quick lookup
    const phoneMap = new Map<string, Partial<Customer>[]>();
    const emailMap = new Map<string, Partial<Customer>[]>();
    const nameMap = new Map<string, Partial<Customer>[]>();

    // Index customers by their identifiers
    batch.forEach(customer => {
      if (!customer.id || processedIds.has(customer.id)) return;

      if (customer.phone_number) {
        const normPhone = normalizePhoneNumber(customer.phone_number);
        phoneMap.set(normPhone, [...(phoneMap.get(normPhone) || []), customer]);
      }

      if (customer.email) {
        emailMap.set(customer.email.toLowerCase(), [
          ...(emailMap.get(customer.email.toLowerCase()) || []),
          customer
        ]);
      }

      if (customer.full_name) {
        const nameKey = metaphone(customer.full_name);
        nameMap.set(nameKey, [...(nameMap.get(nameKey) || []), customer]);
      }
    });

    // Find duplicates within the indexed batch
    for (const customer of batch) {
      if (!customer.id || processedIds.has(customer.id)) continue;

      const duplicates = new Set<DuplicateMatch>();
      const matchReasons = new Set<string>();

      // Check phone numbers
      if (customer.phone_number) {
        const normPhone = normalizePhoneNumber(customer.phone_number);
        const phoneMatches = phoneMap.get(normPhone) || [];
        phoneMatches.forEach(match => {
          if (match.id !== customer.id) {
            duplicates.add({
              id: match.id!,
              full_name: match.full_name!,
              phone_number: match.phone_number,
              email: match.email,
              similarity: 1,
              match_reason: ['Exact phone number match']
            });
            matchReasons.add('Phone number match');
          }
        });
      }

      // Check emails
      if (customer.email) {
        const emailMatches = emailMap.get(customer.email.toLowerCase()) || [];
        emailMatches.forEach(match => {
          if (match.id !== customer.id) {
            duplicates.add({
              id: match.id!,
              full_name: match.full_name!,
              phone_number: match.phone_number,
              email: match.email,
              similarity: 1,
              match_reason: ['Exact email match']
            });
            matchReasons.add('Email match');
          }
        });
      }

      // Check names
      if (customer.full_name) {
        const nameKey = metaphone(customer.full_name);
        const nameMatches = nameMap.get(nameKey) || [];
        nameMatches.forEach(match => {
          if (match.id !== customer.id) {
            const similarity = calculateNamePartsSimilarity(
              customer.full_name!,
              match.full_name!
            );
            if (similarity >= similarityThreshold) {
              duplicates.add({
                id: match.id!,
                full_name: match.full_name!,
                phone_number: match.phone_number,
                email: match.email,
                similarity,
                match_reason: ['Similar name']
              });
              matchReasons.add('Name similarity');
            }
          }
        });
      }

      // If duplicates found, create a new cluster
      if (duplicates.size > 0) {
        const duplicateArray = Array.from(duplicates);
        clusters.push({
          customers: [
            {
              id: customer.id,
              full_name: customer.full_name!,
              phone_number: customer.phone_number,
              email: customer.email,
              similarity: 1,
              match_reason: Array.from(matchReasons)
            },
            ...duplicateArray
          ],
          similarity: Math.max(...duplicateArray.map(d => d.similarity)),
          match_reasons: Array.from(matchReasons)
        });
        totalDuplicates += duplicates.size;
      }

      processedIds.add(customer.id);
    }
  }

  return {
    clusters: clusters.sort((a, b) => b.similarity - a.similarity),
    totalDuplicates,
    processedCount: processedIds.size
  };
}
