import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip/index";
import { queryKeys } from "@/constants/query-keys";

import {
  getNotifications,
  readAllNotifications,
} from "@/actions/notifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationItem } from "./notification-item";

export const NotificationsPopover = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("unread");

  const queryClient = useQueryClient();

  const isMobile = useIsMobile();

  const { data: notifications } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5,
  });

  const allNotifications = notifications ?? [];

  useEffect(() => {
    if (!!notifications) {
      const unreadLength = notifications.filter((item) => !item.readAt).length;

      if (unreadLength <= 0) setTab("all");
    }
  }, [notifications]);

  const unreadNotifications = allNotifications.filter(
    (notification) => !notification.readAt,
  );

  const hasUnreadNotifications = !!unreadNotifications.length;

  const { mutate: handleMarkAllAsRead } = useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const handleClose = () => {
    if (hasUnreadNotifications) handleMarkAllAsRead();

    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        if (value && hasUnreadNotifications) setTab("unread");

        if (!value) {
          return handleClose();
        }

        setOpen(value);
      }}
    >
      <PopoverTrigger
        render={
          <Tooltip content="Notificações">
            <Button variant="outline" size="icon" className="relative">
              <Bell />

              {hasUnreadNotifications && (
                <div className="absolute w-2 h-2 rounded-full bg-primary -top-0.5 -right-0.5">
                  <div className="w-full h-full rounded-full bg-primary animate-ping"></div>
                </div>
              )}
            </Button>
          </Tooltip>
        }
      ></PopoverTrigger>
      <PopoverContent
        sideOffset={18}
        side={isMobile ? "top" : "right"}
        align={isMobile ? "center" : "end"}
        className="w-[380px] max-w-screen"
      >
        <p className="font-semibold mb-2">Notificações</p>
        <Tabs className="w-full" value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="unread">Não lidas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>

          <TabsContent
            value="all"
            className="max-h-[380px] pr-2 overflow-y-auto"
          >
            {!allNotifications.length && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma notificação encontrada.
              </p>
            )}
            {allNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleClose}
              />
            ))}
          </TabsContent>

          <TabsContent
            value="unread"
            className="max-h-[380px] pr-2 overflow-y-auto"
          >
            {!unreadNotifications.length && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma notificação não lida encontrada.
              </p>
            )}
            {unreadNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleClose}
              />
            ))}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
