import { IAppointment } from "../models/appointment/appointmentInterface";
import { ProfitData } from "../types/types";

export interface IAdminDashboard {
    getAdminDashboard(): Promise<{
        summary: {
            doctors: number;
            patients: number;
            appointments: number;
            profit?:number;
        };
        latestAppointments: IAppointment[];
    }>;

    getProfitData(range: 'weekly' | 'monthly' | 'yearly' ): Promise<ProfitData>;
    getCustomProfitData(dateRange: { startDate: Date; endDate: Date }): Promise<ProfitData>;
}
