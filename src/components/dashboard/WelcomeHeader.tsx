
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Sun, Moon, CloudSun, UserRound, Settings, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { NotificationsButton } from "@/components/layout/NotificationsButton";

const motivationalQuotes = [
  "النجاح ليس نهائيًا، والفشل ليس قاتلًا: الشجاعة للاستمرار هي ما يهم.",
  "الطريقة الوحيدة للقيام بعمل رائع هي أن تحب ما تفعله.",
  "آمن بأنك قادر وقد قطعت نصف الطريق.",
  "الجودة تعني القيام بالأمر الصحيح عندما لا يراقبك أحد.",
  "أفضل طريقة للتنبؤ بالمستقبل هي إنشاؤه.",
  "التميز ليس مهارة، بل هو موقف.",
  "اجعل كل يوم تحفة فنية خاصة بك.",
  "طريق النجاح دائمًا قيد الإنشاء.",
];

const getTimeConfig = (hour: number): { icon: LucideIcon; gradient: string; greeting: string } => {
  if (hour < 12) {
    return {
      icon: Sun,
      gradient: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
      greeting: "صباح الخير"
    };
  }
  if (hour < 18) {
    return {
      icon: CloudSun,
      gradient: "from-blue-500/20 via-cyan-500/20 to-sky-500/20",
      greeting: "مساء الخير"
    };
  }
  return {
    icon: Moon,
    gradient: "from-indigo-500/20 via-purple-500/20 to-violet-500/20",
    greeting: "مساء الخير"
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
          <div className={`p-2 rounded-full bg-gradient-to-r ${timeConfig.gradient} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group animate-fade-in`}>
            <TimeIcon className="h-6 w-6 text-foreground/80 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/70 animate-fade-in">
            {timeConfig.greeting}، {profile?.full_name || 'المستخدم'}
          </h1>
        </div>
        <div className="flex items-center gap-2 animate-fade-in">
          <TooltipProvider>
            <NotificationsButton />

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <UserProfileMenu />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>الملف الشخصي</p>
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
                <p>الإعدادات</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-foreground/70 italic animate-fade-in hover:text-foreground/90 transition-colors">
          "{quote}"
        </p>
        <p className="text-sm text-foreground/60 whitespace-nowrap animate-fade-in font-mono">
          {format(currentTime, "EEEE, MMMM do, yyyy • h:mm a")}
        </p>
      </div>
    </div>
  );
};
