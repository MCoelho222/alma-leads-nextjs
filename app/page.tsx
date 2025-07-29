"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [resume, setResume] = useState<File | null>(null);
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    website: string;
    categories: string[];
    reason: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    website: "",
    categories: [],
    reason: "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const updated = checked
        ? [...form.categories, value]
        : form.categories.filter((v) => v !== value);
      setForm({ ...form, categories: updated });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, value);
      }
    });
    if (resume) {
      formData.append("resume", resume);
    }

    const res = await fetch("/api/leads", {
      method: "POST",
      body: formData,
    });

    if (res.ok) router.push("/thank-you");
  };

  return (
    <main className="bg-white font-sans min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-0 pb-0">
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] overflow-hidden mb-4 sm:mb-6">
          <Image
            src="/images/banner.png"
            alt="Immigration case assessment banner"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 768px, 768px"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Image
            src="/icons/file-icon.png"
            alt="Info document"
            width={64}
            height={64}
            className="mx-auto mb-3 sm:mb-4"
          />
          <h2 className="text-lg sm:text-xl font-bold text-center">
            Want to understand your visa options?
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[calc(100vw-2rem)] sm:w-[calc(768px-3rem)] max-w-none">
              <p className="text-center font-bold text-xs sm:text-sm px-4">
                Submit the form below and our team of experienced attorneys will
                review your information and send a preliminary assessment of
                your case based on your goals.
              </p>
            </div>
            <div className="h-12 sm:h-16"></div>
          </div>
        </form>
      </div>
      <div className="max-w-xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              name="firstName"
              value={form.firstName}
              placeholder="First Name"
              required
              className="input"
              onChange={handleChange}
            />
            <input
              name="lastName"
              value={form.lastName}
              placeholder="Last Name"
              required
              className="input"
              onChange={handleChange}
            />
          </div>

          <input
            name="email"
            value={form.email}
            type="email"
            placeholder="Email"
            required
            className="input"
            onChange={handleChange}
          />
          <input
            name="country"
            value={form.country}
            placeholder="Country of Citizenship"
            required
            className="input"
            onChange={handleChange}
          />
          <input
            name="website"
            value={form.website}
            placeholder="LinkedIn / Personal Website URL"
            className="input"
            onChange={handleChange}
          />
          <div>
            <label
              htmlFor="resume"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Upload your resume
            </label>
            <input
              id="resume"
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              className="input file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
            />
          </div>
          <Image
            src="/icons/dice-icon.png"
            alt="Dice icon"
            width={64}
            height={64}
            className="mx-auto mb-3 sm:mb-4"
          />
          <fieldset>
            <legend className="text-lg sm:text-xl font-bold mb-2 text-center">
              Visa categories of interest?
            </legend>
            <label className="block">
              <input
                type="checkbox"
                name="categories"
                value="O-1"
                checked={form.categories.includes("O-1")}
                onChange={handleChange}
              />{" "}
              O-1
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="categories"
                value="EB-1A"
                checked={form.categories.includes("EB-1A")}
                onChange={handleChange}
              />{" "}
              EB-1A
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="categories"
                value="EB-2 NIW"
                checked={form.categories.includes("EB-2 NIW")}
                onChange={handleChange}
              />{" "}
              EB-2 NIW
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="categories"
                value="I don't know"
                checked={form.categories.includes("I don't know")}
                onChange={handleChange}
              />{" "}
              I don't know
            </label>
          </fieldset>

          <div className="text-center space-y-3 sm:space-y-4">
            <Image
              src="/icons/heart-icon.png"
              alt="Heart icon"
              width={64}
              height={64}
              className="mx-auto mb-3 sm:mb-4"
            />

            <h2 className="text-lg sm:text-xl font-bold">
              How can we help you?
            </h2>

            <textarea
              name="reason"
              required
              className="input h-32 sm:h-40 resize-y text-sm"
              placeholder={`What is your current status and when does it expire?\nWhat is your past immigration history? Are you looking for long-term permanent residency or short-term employment visa or both? Are there any timeline considerations?`}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white w-full py-2 sm:py-3 rounded font-semibold text-sm sm:text-base"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
