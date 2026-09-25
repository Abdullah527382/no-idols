// Builds a wa.me deep link pre-populated with a follow-up nudge message.
export function buildWhatsAppNudge(
  member,
  { paymentLink = "https://noidols.org/pay" } = {},
) {
  const digits = member.phone.replace(/[^\d]/g, "");

  const message =
    member.paymentStatus !== "Paid"
      ? `Hey ${firstName(member.name)}, Harris here from No Idols. Noticed your dues for this month are ${member.paymentStatus.toLowerCase()}—here's your quick payment link: ${paymentLink}`
      : `Hey ${firstName(member.name)}, Harris here from No Idols. We missed you at the last session, brother — everything good? Next one's coming up soon, let's get you back in.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function firstName(fullName) {
  return fullName.split(" ")[0];
}
