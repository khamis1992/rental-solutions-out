
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Sun, Moon, CloudSun, UserRound, Settings, BellRing, Search, Calendar, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import { Input } from "@/components/ui/input";

const motivationalQuotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Quality means doing it right when no one is looking.",
  "The best way to predict the future is to create it.",
  "Excellence is not a skill, it's an attitude.",
  "Make each day your masterpiece.",
  "The road to success is always under construction.",
  "The difference between ordinary and extraordinary is that little extra.",
  "The secret of getting ahead is getting started.",
];

const getTimeConfig = (hour: number): { icon: LucideIcon; gradient: string; greeting: string } => {
  if (hour < 12) {
    return {
      icon: Sun,
      gradient: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
      greeting: "Good morning"
    };
  }
  if (hour < 18) {
    return {
      icon: CloudSun,
      gradient: "from-blue-500/20 via-cyan-500/20 to-sky-500/20",
      greeting: "Good afternoon"
    };
  }
  return {
    icon: Moon,
    gradient: "from-indigo-500/20 via-purple-500/20 to-violet-500/20",
    greeting: "Good evening"
  };
};

export const WelcomeHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState("");
  const navigate = useNavigate();

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

  const timeConfig = getTimeConfig(currentTime.getHours());
  const TimeIcon = timeConfig.icon;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full bg-gradient-to-r ${timeConfig.gradient} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group animate-fade-in`}>
            <TimeIcon className="h-6 w-6 text-foreground/80 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/70 animate-fade-in">
              {timeConfig.greeting}, {profile?.full_name || 'User'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(currentTime, "EEEE, MMMM do, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 animate-fade-in">
          <div className="relative rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center pr-2 max-w-xs w-full transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/50">
            <Input 
              type="search" 
              placeholder="Search..." 
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-3 py-2 h-9 text-sm" 
            />
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-foreground/80 hover:text-foreground hover:bg-background/80 transition-colors border-gray-200 shadow-sm"
                  onClick={() => navigate('/calendar')}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Calendar</p>
              </TooltipContent>
            </Tooltip>

            <NotificationsButton />

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <UserProfileMenu />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-foreground/80 hover:text-foreground hover:bg-background/80 transition-colors"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-sm text-muted-foreground italic animate-fade-in hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-default">
        <p className="flex items-center">
          <span className="text-indigo-500 mr-2">❝</span>
          {quote}
          <span className="text-indigo-500 ml-1">❞</span>
        </p>
      </div>
    </div>
  );
};
