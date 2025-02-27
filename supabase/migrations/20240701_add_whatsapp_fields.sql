
-- Add WhatsApp specific fields to the sms_messages table
ALTER TABLE IF EXISTS public.sms_messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'sms',
ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_template_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_status TEXT,
ADD COLUMN IF NOT EXISTS message_metadata JSONB DEFAULT '{}'::jsonb;

-- Create an index on message_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_sms_messages_message_type ON public.sms_messages(message_type);

-- Add comment to explain the message_type field
COMMENT ON COLUMN public.sms_messages.message_type IS 'Type of message: sms or whatsapp';
