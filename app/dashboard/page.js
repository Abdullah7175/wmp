"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { MessageCircleWarning, Activity, CheckCheck, Plus } from "lucide-react"
import { LineChartWithValues } from "@/components/lineChart"
import { PieChartWithValues } from "@/components/pieChart"
import dynamic from "next/dynamic";
import Link from "next/link";
import { QuestionMarkCircledIcon, QuestionMarkIcon } from "@radix-ui/react-icons";
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

const page = () => {
    return (
        <div className="container mx-auto px-4 py-3">
            <div className="py-4">
                <Link href="/dashboard/requests/new">
                    <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Request
                    </button>
                </Link>
            </div>
            <div className="flex flex-col lg:flex-row w-full gap-5">
                <Card className="w-full lg:w-1/3 bg-slate-50 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <MessageCircleWarning className="text-yellow-700" />
                        <div className="flex-1 space-y-1">
                            <p className="text-md font-medium leading-none">
                                Total Requests
                            </p>
                            <p className="text-sm text-muted-foreground">
                                1200
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="w-full lg:w-1/3 bg-slate-50 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <Activity className="text-red-700" />
                        <div className="flex-1 space-y-1">
                            <p className="text-md font-medium leading-none">
                                Active Request
                            </p>
                            <p className="text-sm text-muted-foreground">
                                500
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="w-full lg:w-1/3 bg-slate-50 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <CheckCheck className="text-green-700" />
                        <div className="flex-1 space-y-1">
                            <p className="text-md font-medium leading-none">
                                Completed Request
                            </p>
                            <p className="text-sm text-muted-foreground">
                                700
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="w-full lg:w-1/3 bg-slate-50 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <QuestionMarkIcon className="text-green-700" />
                        <div className="flex-1 space-y-1">
                            <p className="text-md font-medium leading-none">
                                Pending Request
                            </p>
                            <p className="text-sm text-muted-foreground">
                                700
                            </p>
                        </div>
                    </div>
                </Card>

            </div>

            <div className="flex flex-col lg:flex-row w-full gap-8 mt-10">
                <div className="w-full xl:w-5/3">
                    <MapComponent />
                </div>
            </div>


            <div className="flex flex-col lg:flex-row w-full gap-8 mt-10">
                <div className="w-full xl:w-2/3">
                    <LineChartWithValues />
                </div>
                <div className="w-full xl:w-1/3">
                    <PieChartWithValues />
                </div>
            </div>

            <div className="flex flex-col bg-slate-100 lg:flex-row w-full gap-8 mt-10 h-10">
        
            </div>
        </div>

    )
}

export default page