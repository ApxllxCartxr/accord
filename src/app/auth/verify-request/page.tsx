import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyRequest() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>
                        A sign in link has been sent to your email address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Click the link in the email to sign in. If you don't see it, check your spam folder.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
