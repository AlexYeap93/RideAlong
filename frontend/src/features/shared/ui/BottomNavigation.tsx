import { Button } from "../../../components/ui/button";
import { BottomNavigationProps } from "../../../types/index";
import { BASE_NAV_ITEMS, ADMIN_NAV_ITEM } from "../../../types/const";

// For the Tabs at the bottom of the page
export function BottomNavigation({ activeTab, onTabChange, isAdmin = false }: BottomNavigationProps) {
  const baseNavItems = BASE_NAV_ITEMS;

  const adminNavItem = ADMIN_NAV_ITEM;

  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50 w-full">
      <div className="flex items-center justify-around py-2 w-full max-w-full overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 flex-shrink-0 ${
                isAdmin ? 'px-2 py-1.5' : 'px-3 py-2'
              } ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onTabChange(item.id)}
              style={{ minWidth: isAdmin ? '20%' : '25%' }}
            >
              <Icon className={`${isAdmin ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
              <span className="text-[10px] sm:text-xs whitespace-nowrap">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}