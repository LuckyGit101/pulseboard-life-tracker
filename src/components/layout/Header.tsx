import { Calendar, BarChart3, DollarSign, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Header = ({ currentPage, onPageChange }: HeaderProps) => {
  const pages = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="bg-white bg-gradient-to-b from-[#f5f6fa] to-[#e9eafc] border-b border-border shadow-2xl rounded-3xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pulse Board</h1>
              </div>
              <p className="text-muted-foreground text-sm">Your productivity pulse</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? "default" : "ghost"}
                  onClick={() => onPageChange(page.id)}
                  className={`transition-all duration-200 hover:scale-105 rounded-xl ${
                    currentPage === page.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {page.label}
                </Button>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" className="text-foreground">
              <Calendar className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex overflow-x-auto gap-1 pb-2">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <Button
                key={page.id}
                variant={currentPage === page.id ? "default" : "ghost"}
                onClick={() => onPageChange(page.id)}
                className={`whitespace-nowrap transition-all duration-200 hover:scale-105 rounded-xl ${
                  currentPage === page.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'hover:bg-gray-100 hover:shadow-md'
                }`}
                size="sm"
              >
                <Icon className="h-4 w-4 mr-1" />
                {page.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;