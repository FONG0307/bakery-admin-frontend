export default function Page() {
  return (
    <section className="h-[60rem] xl:h-screen flex flex-col xl:flex-row pt-20">
      <div className="bg-chef-about-bg bg-no-repeat bg-cover bg-center h-full w-full border-x-4 border-black border-b-4 border-black xl:border-b-0 2xl:w-[120rem]"></div>
      
      <div className="flex flex-col xl:flex-col">
        <div className="bg-Sky_Whisper border-x-4 border-black border-b-4 border-black xl:border-l-0 xl:h-full xl:px-14">
          <h1 className="text-base font-extrabold p-6 xl:text-5xl xl:leading-normal xl:py-20">A sweet, gluten-free <br /> treat for any occasion</h1>
        </div>
        <div className="bg-Pink_Passion border-x-8 border-b-0 xl:border-l-0 xl:h-full xl:px-14">
          <p className="text-base font-bold p-6 xl:text-xl">
            The story of Bakery~ began when our head chef/founder, <span className="font-extrabold">Clairine Ng</span>, decided to take a leap of faith and open a cakery in the heart of Singapore. Inspired by her sister who struggled with Celiac disease, Clairine decided to ensure all of our products are gluten-free. As soon as we opened, we knew we were onto something unique.
          </p>
          <p className="text-base font-bold p-6 xl:text-base">
            Our gluten-free cupcakes are made with healthy coconut flour, almonds, flax seed, and other ingredients to create the perfect treat for you.
          </p>
        </div>
      </div>
    </section>
  );
}
