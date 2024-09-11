'use client'

import {
  Calendar as BigCalendar,
  CalendarProps,
  momentLocalizer
} from "react-big-calendar";
import moment from "moment";
import { useCallback } from "react";

const localizer = momentLocalizer(moment);

export default function Calendar(props: Omit<CalendarProps, "localizer">) {

  const eventPropGetter = useCallback(
    (event) => ({
      ...(event.isNew ? {
        style: {
          backgroundColor: '#f97315', // Background color for new events
          border: '1px solid #e36c1f', // Border color for new events
        },
      } : {
        style: {
          backgroundColor: '#f5f5f4', // Background color for non-new events
          border: '1px solid #cccccc', // Border color for non-new events
          color: '#000'
        },
      }),
    }),
    []
  );

  return <BigCalendar {...props}
    localizer={localizer}
    eventPropGetter={eventPropGetter}
  />;
}