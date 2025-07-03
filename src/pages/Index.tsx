import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">LegTalk</h1>
          <Button variant="ghost">Menu</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="flex items-center justify-center min-h-[300px] bg-muted rounded-lg">
            <h2 className="text-4xl font-bold">LegTalk</h2>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <p className="text-lg text-muted-foreground">
              This is LegTalk, a legislation tracking portal made for members who want to stay informed about legislative changes and participate in the democratic process as engaged citizens.
            </p>
            <p className="text-lg text-muted-foreground">
              The platform is designed to be as simple as possible, providing a clean interface with essential tracking features and member interactions.
            </p>
            <p className="text-lg text-muted-foreground">
              Track bills, monitor committee activities, and stay updated on legislative progress with real-time notifications and comprehensive bill analysis.
            </p>
          </div>
        </div>

        {/* Bills Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Current Bills</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Bill HR-2024-001</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Bill SB-2024-055</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Bill AB-2024-123</h3>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Committee Updates */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Committee Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Judiciary Committee</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Finance Committee</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Health Committee</h3>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Member Resources */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Member Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Voting Guide</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Legislative Calendar</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Member Directory</h3>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[150px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Search Bills</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[150px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Track Progress</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[150px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Alerts</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[150px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Reports</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[150px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Analysis</h3>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border rounded-lg p-6 min-h-[150px] flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold">Support</h3>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="text-sm text-muted-foreground">hello@legtalk.com</p>
            </div>
            <div className="flex space-x-4">
              {/* Social icons would go here */}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-muted-foreground">© LegTalk. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Privacy Policy</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
