import ContactForm from "../ui/ContactForm";

export default function Page() {
  return (
    <section className="h-screen flex flex-col md:flex-row pt-20">
      <ContactForm />

      <div className="bg-Pink_Passion border-x-4 border-black border-b-0 flex flex-col gap-10 p-8 h-full items-center justify-center md:w-7/12 md:justify-start">
        <p className="text-base font-bold md:text-4xl md:mt-14">
          Have questions or feedback? We&apos;d love to hear from you! Feel free to
          reach out.
        </p>

        <p className="text-base font-bold md:text-4xl md:mt-14"> We&apos;re here to help and provide you with the information you need.</p>
      </div>
    </section>
  );
}
