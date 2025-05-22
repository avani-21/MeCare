"use strict";
// // src/utils/slotGenerator.ts
// import { Types } from "mongoose";
// import { ISlotDTO } from "../types/types";
// export class SlotGenerator {
//   private static dayAbbreviations: Record<string, string> = {
//     MON: 'Monday',
//     TUE: 'Tuesday',
//     WED: 'Wednesday',
//     THU: 'Thursday',
//     FRI: 'Friday',
//     SAT: 'Saturday',
//     SUN: 'Sunday'
//   };
//   static generateMonthlySlots(
//     doctorId: string,
//     availableDays: string[], // Expects ['MON', 'TUE', etc.]
//     options: {
//       startHour?: number;
//       endHour?: number;
//       slotDuration?: number;
//       daysToGenerate?: number;
//     } = {}
//   ): ISlotDTO[] {
//     const {
//       startHour = 9,    // Default 9 AM
//       endHour = 17,     // Default 5 PM
//       slotDuration = 30, // Default 30 minutes
//       daysToGenerate = 30 // Default 30 days
//     } = options;
//     const slots: ISlotDTO[] = [];
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     for (let i = 0; i < daysToGenerate; i++) {
//       const date = new Date(today);
//       date.setDate(date.getDate() + i);
//       // Get full day name (e.g., "Wednesday")
//       const dayName = date.toLocaleDateString("en-US", { 
//         weekday: "long",
//         timeZone: "UTC"
//       });
//       // Convert available day abbreviations to full names for comparison
//       const availableFullDays = availableDays.map(abbr => 
//         this.dayAbbreviations[abbr.toUpperCase()]
//       );
//       if (!availableFullDays.includes(dayName)) continue;
//       let currentTime = startHour;
//       while (currentTime < endHour) {
//         const startHours = Math.floor(currentTime);
//         const startMinutes = Math.floor((currentTime % 1) * 60);
//         const endTime = currentTime + (slotDuration / 60);
//         const endHours = Math.floor(endTime);
//         const endMinutes = Math.floor((endTime % 1) * 60);
//         slots.push({
//           doctorId: new Types.ObjectId(doctorId),
//           date: new Date(date),
//           startTime: `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`,
//           endTime: `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`,
//           isBooked: false,
//           isAvailable: true
//         });
//         currentTime = endTime;
//       }
//     }
//     return slots;
//   }
// }
