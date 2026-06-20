import {
  MessageSquare,
  Reply,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          Overview of your EchoSpace account.
        </p>
      </div>

      {/* Stats */}

      <div className="grid gap-4 md:grid-cols-3">

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <MessageSquare className="h-8 w-8" />

            <div>
              <p className="text-2xl font-bold">
                128
              </p>

              <p className="text-sm text-muted-foreground">
                Total Messages
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Reply className="h-8 w-8" />

            <div>
              <p className="text-2xl font-bold">
                42
              </p>

              <p className="text-sm text-muted-foreground">
                Total Replies
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <BarChart3 className="h-8 w-8" />

            <div>
              <p className="text-2xl font-bold">
                +18%
              </p>

              <p className="text-sm text-muted-foreground">
                Weekly Growth
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}

      <div className="grid gap-6 lg:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>
              Quick Actions
            </CardTitle>

            <CardDescription>
              Common tasks you perform.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  View Inbox
                </p>

                <p className="text-sm text-muted-foreground">
                  Read incoming anonymous message.
                </p>
              </div>

              <ArrowUpRight className="h-4 w-4" />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Manage Replies
                </p>

                <p className="text-sm text-muted-foreground">
                  Continue anonymous conversations.
                </p>
              </div>

              <ArrowUpRight className="h-4 w-4" />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Recent Activity
            </CardTitle>

            <CardDescription>
              Latest events on your account.
            </CardDescription>
          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              <div className="border-l-2 pl-4">
                <p className="font-medium">
                  New anonymous message received
                </p>

                <p className="text-sm text-muted-foreground">
                  2 minutes ago
                </p>
              </div>

              <div className="border-l-2 pl-4">
                <p className="font-medium">
                  Reply sent successfully
                </p>

                <p className="text-sm text-muted-foreground">
                  15 minutes ago
                </p>
              </div>

              <div className="border-l-2 pl-4">
                <p className="font-medium">
                  Profile link viewed
                </p>

                <p className="text-sm text-muted-foreground">
                  1 hour ago
                </p>
              </div>

            </div>

          </CardContent>
        </Card>

      </div>

      {/* Feature Status */}

      <Card>
        <CardHeader>
          <CardTitle>
            Platform Status
          </CardTitle>

          <CardDescription>
            Current state of your EchoSpace workspace.
          </CardDescription>
        </CardHeader>

        <CardContent>

          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-lg border p-4">
              <p className="font-medium">
                Inbox
              </p>

              <p className="text-sm text-muted-foreground">
                Active
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium">
                Anonymous Replies
              </p>

              <p className="text-sm text-muted-foreground">
                Enabled
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium">
                Analytics
              </p>

              <p className="text-sm text-muted-foreground">
                Coming Soon
              </p>
            </div>

          </div>

        </CardContent>
      </Card>

    </div>
  );
}