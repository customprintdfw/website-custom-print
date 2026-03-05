import { useState, useRef } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, Loader2, Paperclip, X } from "lucide-react";

// 👉 Replace with your Formspree form ID from https://formspree.io
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

type FormState = "idle" | "submitting" | "success" | "error";

export const ContactSection = () => {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    service: "",
    message: "",
  });
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setArtworkFile(file);
  };

  const handleRemoveFile = () => {
    setArtworkFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("name", fields.name);
      formData.append("email", fields.email);
      formData.append("service", fields.service);
      formData.append("message", fields.message);
      if (artworkFile) {
        formData.append("artwork", artworkFile);
      }

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (res.ok) {
        setFormState("success");
        setFields({ name: "", email: "", service: "", message: "" });
        setArtworkFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const data = await res.json();
        setErrorMessage(data?.errors?.[0]?.message ?? "Something went wrong. Please try again.");
        setFormState("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  };

  const isSubmitting = formState === "submitting";

  return (
    <div id="contact" className="bg-black text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-josefin_sans mb-4">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-lime-400 to-yellow-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 font-montserrat max-w-2xl mx-auto">
            Ready to bring your vision to life? Contact us today for a free quote
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-lime-400 to-yellow-400 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-josefin_sans mb-2">Location</h3>
                <a
                  href="https://maps.google.com/?q=116+N.+Adelaide+St.+Terrell+TX+75160"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lime-400 hover:text-lime-300 font-montserrat transition-colors"
                >
                  116 N. Adelaide St.<br />
                  Terrell, TX 75160
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-lime-400 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-josefin_sans mb-2">Phone</h3>
                <a
                  href="https://voice.google.com/calls?a=nc,%2B19728631551"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lime-400 hover:text-lime-300 font-montserrat text-lg"
                >
                  972.863.1551
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-yellow-400 to-lime-400 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-josefin_sans mb-2">Email</h3>
                <a
                  href="https://mail.google.com/mail/?view=cm&to=order@customprintdfw.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lime-400 hover:text-lime-300 font-montserrat text-lg"
                >
                  order@customprintdfw.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-lime-400 to-blue-600 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-josefin_sans mb-2">Business Hours</h3>
                <a
                  href="https://www.google.com/search?q=CustomPrint+DFW+Terrell+TX+hours"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-lime-400 font-montserrat transition-colors"
                >
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-900 rounded-xl p-8 border-2 border-lime-400">
            <h3 className="text-2xl font-bold font-josefin_sans mb-6">Request a Quote</h3>

            {formState === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-lime-400" />
                <h4 className="text-2xl font-bold font-josefin_sans text-lime-400">Message Sent!</h4>
                <p className="text-gray-300 font-montserrat">
                  Thanks for reaching out! We'll get back to you within 1 business day.
                </p>
                <button
                  onClick={() => setFormState("idle")}
                  className="mt-4 text-sm text-lime-400 hover:text-lime-300 underline font-montserrat"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-montserrat mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={fields.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-black border-2 border-gray-700 focus:border-lime-400 outline-none transition-colors text-white disabled:opacity-50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-montserrat mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={fields.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-black border-2 border-gray-700 focus:border-lime-400 outline-none transition-colors text-white disabled:opacity-50"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-montserrat mb-2">Service</label>
                  <select
                    name="service"
                    value={fields.service}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-black border-2 border-gray-700 focus:border-lime-400 outline-none transition-colors text-white disabled:opacity-50"
                  >
                    <option value="">Select a service</option>
                    <option>CNC Work</option>
                    <option>Car Wrap</option>
                    <option>DTF Printing</option>
                    <option>T-Shirt Printing</option>
                    <option>Embroidery</option>
                    <option>Signs</option>
                    <option>Banners</option>
                  </select>
                </div>
                {/* Artwork Upload */}
                <div>
                  <label className="block text-sm font-montserrat mb-2">
                    Artwork / Design File{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.ai,.eps,.svg,.psd,.png,.jpg,.jpeg,.gif,.tiff,.tif"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="hidden"
                    id="artwork-upload"
                  />
                  {artworkFile ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-black border-2 border-lime-400 text-white">
                      <Paperclip className="w-4 h-4 text-lime-400 shrink-0" />
                      <span className="flex-1 text-sm font-montserrat truncate text-lime-300">
                        {artworkFile.name}
                      </span>
                      <span className="text-xs text-gray-500 shrink-0">
                        {(artworkFile.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-red-400 transition-colors shrink-0"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="artwork-upload"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-black border-2 border-dashed border-gray-600 hover:border-lime-400 transition-colors cursor-pointer group ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <Paperclip className="w-5 h-5 text-gray-500 group-hover:text-lime-400 transition-colors" />
                      <span className="text-gray-400 group-hover:text-lime-300 font-montserrat text-sm transition-colors">
                        Click to upload artwork (PNG, JPG, PDF, AI, EPS, SVG…)
                      </span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-montserrat mb-2">Message</label>
                  <textarea
                    name="message"
                    value={fields.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-black border-2 border-gray-700 focus:border-lime-400 outline-none transition-colors text-white resize-none disabled:opacity-50"
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>

                {formState === "error" && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-500 rounded-lg text-red-400 text-sm font-montserrat">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-lg hover:from-lime-300 hover:to-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
