
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Sun, Moon, CloudSun, Bell, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const motivationalQuotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Quality means doing it right when no one is looking.",
  "The best way to predict the future is to create it.",
  "Excellence is not a skill, it's an attitude.",
  "Make each day your masterpiece.",
  "The road to success is always under construction.",
];

export const WelcomeHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState("");

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      return profile;
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

    return () => clearInterval(timer);
  }, []);

  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return <Sun className="h-6 w-6 text-yellow-500" />;
    if (hour < 18) return <CloudSun className="h-6 w-6 text-blue-500" />;
    return <Moon className="h-6 w-6 text-purple-500" />;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {getTimeIcon()}
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, {profile?.full_name || 'User'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
            <Calendar className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-[#D3D3D3] italic">
          "{quote}"
        </p>
        <p className="text-sm text-[#B0B0B0] whitespace-nowrap">
          {format(currentTime, "EEEE, MMMM do, yyyy • h:mm a")}
        </p>
      </div>
    </div>
  );
};
