
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bell, 
  Calendar, 
  Search, 
  Settings, 
  UserCircle, 
  Sun, 
  Moon, 
  CloudSun,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [weatherIcon, setWeatherIcon] = useState<React.ReactNode>(<Sun />);

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Set the greeting and weather icon based on time of day
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 5) {
      setGreeting("Good Night");
      setWeatherIcon(<Moon className="text-indigo-400" />);
    } else if (hour < 12) {
      setGreeting("Good Morning");
      setWeatherIcon(<Sun className="text-amber-400" />);
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
      setWeatherIcon(<CloudSun className="text-blue-400" />);
    } else {
      setGreeting("Good Evening");
      setWeatherIcon(<Moon className="text-indigo-400" />);
    }
  }, [currentTime]);
  
  // Set a motivational quote
  useEffect(() => {
    const quotes = [
      { text: "The road to success is always under construction.", author: "Lily Tomlin" },
      { text: "Quality in a service is not what you put into it. It's what the customer gets out of it.", author: "Peter Drucker" },
      { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
      { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
      { text: "Don't find customers for your products, find products for your customers.", author: "Seth Godin" },
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);
  
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <Card className={cn(
      "relative overflow-hidden border border-border/40",
      "shadow-sm hover:shadow-md transition-all duration-200",
      "group"
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <div className="p-1.5 bg-card rounded-full shadow-sm">
                {weatherIcon}
              </div>
              {greeting}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary/70" />
              <span>{formattedDate}</span>
              <span className="mx-1">•</span>
              <span className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                {formattedTime}
              </span>
            </div>
            <p className="text-sm italic text-muted-foreground hidden sm:block group-hover:animate-pulse-subtle">
              "{quote.text}" <span className="font-medium">— {quote.author}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Button variant="outline" size="sm" className={cn(
                "rounded-full w-10 h-10 p-0",
                "hover:bg-primary/10 transition-all duration-300"
              )}>
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
            
            <div className="relative">
              <Button variant="outline" size="sm" className={cn(
                "rounded-full w-10 h-10 p-0 hover:bg-primary/10",
                "transition-all duration-300 relative"
              )}>
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white">
                  3
                </span>
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className={cn(
              "rounded-full w-10 h-10 p-0 hover:bg-primary/10",
              "transition-all duration-300"
            )}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            
            <Button variant="outline" size="sm" className={cn(
              "rounded-full w-10 h-10 p-0 hover:bg-primary/10",
              "transition-all duration-300 relative overflow-hidden"
            )}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 opacity-0 hover:opacity-100 transition-opacity"></div>
              <UserCircle className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
