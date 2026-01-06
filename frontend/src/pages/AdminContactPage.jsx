import { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, User, Mail, Clock, Loader2 } from "lucide-react";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/contact")
      .then((res) => setMessages(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="h-6 w-6" />
              Contact Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet.</p>
              </div>
            )}

            {!isLoading && messages.length > 0 && (
              <div className="space-y-4">
                {messages.map((m) => (
                  <Card key={m.id} className="border">
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${m.email}`} className="hover:underline">
                            {m.email}
                          </a>
                        </div>
                      </div>

                      <Separator className="mb-4" />

                      <p className="text-foreground whitespace-pre-wrap">{m.message}</p>

                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Received: {new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
