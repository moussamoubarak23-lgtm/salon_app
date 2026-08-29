export function generateGoogleCalendarLink(service: string, date: Date, slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  const start = new Date(date);
  start.setHours(hours, minutes, 0);

  const end = new Date(start);
  end.setMinutes(start.getMinutes() + 60); // Default 1 hour

  const format = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const title = encodeURIComponent(`✂️ RDV Centre de Beauté Zara - ${service}`);
  const details = encodeURIComponent(`Votre rendez-vous pour ${service} au Centre de Beauté Zara.`);
  const location = encodeURIComponent("Centre de Beauté Zara, Niamey, Niger");

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${format(start)}/${format(end)}`;
}

export function downloadICSFile(service: string, date: Date, slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  const start = new Date(date);
  start.setHours(hours, minutes, 0);

  const end = new Date(start);
  end.setMinutes(start.getMinutes() + 60);

  const format = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:✂️ RDV Centre de Beauté Zara - ${service}`,
    `DESCRIPTION:Votre rendez-vous pour ${service} au Centre de Beauté Zara.`,
    "LOCATION:Centre de Beauté Zara, Niamey, Niger",
    "BEGIN:VALARM",
    "TRIGGER:-PT60M", // 1 hour before
    "ACTION:DISPLAY",
    "DESCRIPTION:Rappel de votre rendez-vous beauté",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `reservation-zara.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
