import { InquiryForm } from "@/components/inquiry-form";
import { salesContacts } from "@/lib/contact";
import { MessageCircle, Phone } from "lucide-react";

export default function Contact() {
  return <main><section className="container grid gap-12 py-16 lg:grid-cols-2 lg:py-20"><div><p className="eyebrow">Kontakt</p><h1 className="display mt-4 text-6xl md:text-8xl">Porozmawiajmy o Twojej przestrzeni.</h1><div className="mt-10 grid gap-3 sm:grid-cols-2">{salesContacts.map(contact=><div className="border border-[#dedfd9] p-5" key={contact.name}><p className="text-xs uppercase tracking-wider text-[#777]">{contact.name}</p><a className="mt-2 flex items-center gap-2 text-lg font-bold" href={contact.phoneHref}><Phone size={18}/>{contact.phoneDisplay}</a><a className="mt-4 flex items-center gap-2 text-sm font-bold text-[#4f6043]" href={contact.whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={17}/>Napisz na WhatsApp</a></div>)}</div><a className="mt-6 block" href="mailto:kontakt@modula.pl">kontakt@modula.pl</a><p className="pt-5 text-sm leading-7 text-[#666b63]">Na wszystkie pytania odpowiemy telefonicznie. Realizujemy zamówienia indywidualne w całej Polsce.</p></div><div className="bg-[#f5f4ef] p-6 md:p-10"><InquiryForm/></div></section></main>;
}
