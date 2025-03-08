
import { useEffect, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { 
  Sun, Moon, Cloud, CloudRain, Wind, CloudSnow, Umbrella, Droplets,
  Bell, Calendar, Search, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const WelcomeHeader = () => {
  const { session } = useSessionContext();
  const [greeting, setGreeting] = useState("");
  const [weatherIcon, setWeatherIcon] = useState<React.ReactNode>(null);
  const [notifications, setNotifications] = useState(3);
  const userName = session?.user?.user_metadata?.full_name || "User";
  
  // Simulate different weather conditions for demo purposes
  const weatherConditions = [
    { icon: Sun, condition: "Sunny" },
    { icon: Cloud, condition: "Cloudy" },
    { icon: CloudRain, condition: "Rainy" },
    { icon: Wind, condition: "Windy" },
    { icon: CloudSnow, condition: "Snowy" },
    { icon: Umbrella, condition: "Stormy" },
    { icon: Droplets, condition: "Humid" }
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    
    // Set appropriate greeting based on time of day
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
      setWeatherIcon(<Sun className="h-6 w-6 text-yellow-500" />);
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good Afternoon");
      setWeatherIcon(<Sun className="h-6 w-6 text-orange-500" />);
    } else {
      setGreeting("Good Evening");
      setWeatherIcon(<Moon className="h-6 w-6 text-indigo-400" />);
    }

    // Randomly pick a weather condition for demonstration
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const WeatherIcon = randomWeather.icon;
    setWeatherIcon(<WeatherIcon className="h-6 w-6 text-blue-500" />);

  }, []);

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-full">
            {weatherIcon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting}, {userName}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your rental fleet today.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                  {notifications}
                </Badge>
              )}
            </Button>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Calendar className="h-4 w-4" />
          </Button>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="w-48 pl-9 rounded-full" 
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
