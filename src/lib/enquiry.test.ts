import { describe, expect, it } from "vitest";
import { cleanEnquiry, validateEnquiry, validateField } from "./enquiry";

const valid = {
  name: "Alex Nguyen",
  company: "Harbour Logistics",
  email: "alex@example.com.au",
  phone: "0412 345 678",
  facilityType: "warehouse",
  location: "Botany 2019",
  message: "Two sites, after-hours access only.",
};

describe("validateEnquiry", () => {
  it("accepts a complete enquiry", () => {
    const result = validateEnquiry(valid);
    expect(result.ok).toBe(true);
  });

  it("trims whitespace and allows the optional fields to be empty", () => {
    const result = validateEnquiry({
      ...valid,
      name: "  Alex Nguyen  ",
      company: "",
      location: "   ",
      message: "",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toMatchObject({ name: "Alex Nguyen", company: "", location: "", message: "" });
  });

  it("treats missing fields as empty, so a hand-built request cannot skip a rule", () => {
    const result = validateEnquiry({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual({
      name: "Enter your full name",
      email: "Enter your email address",
      phone: "Enter a phone number",
      facilityType: "Choose a facility type",
    });
  });

  it("reports every invalid field at once, one message each", () => {
    const result = validateEnquiry({ ...valid, name: "", email: "nope", phone: "1" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors)).toEqual(["name", "email", "phone"]);
  });

  it("normalises line breaks in the message", () => {
    const result = validateEnquiry({ ...valid, message: "Line one\r\nLine two\r\n" });
    expect(result.ok && result.data.message).toBe("Line one\nLine two");
  });
});

describe("name", () => {
  it.each(["Al", "Alex Nguyen", "José O'Brien-Smith", "李雷"])("accepts %j", (name) => {
    expect(validateField("name", name)).toBeNull();
  });

  it.each(["", "A", "12345", "---", "x".repeat(101)])("rejects %j", (name) => {
    expect(validateField("name", name)).not.toBeNull();
  });
});

describe("email", () => {
  it.each(["alex@example.com.au", "a.b+tag@sub.example.org", "x@y.co"])("accepts %j", (email) => {
    expect(validateField("email", email)).toBeNull();
  });

  it.each(["", "alex", "alex@", "@example.com", "alex@example", "alex@example.c", "a b@example.com", "alex@@example.com", `${"x".repeat(250)}@a.co`])(
    "rejects %j",
    (email) => {
      expect(validateField("email", email)).not.toBeNull();
    },
  );
});

describe("phone", () => {
  it.each(["0412 345 678", "(02) 9123 4567", "+61 412 345 678", "1300 639 436", "0291234567"])(
    "accepts %j",
    (phone) => {
      expect(validateField("phone", phone)).toBeNull();
    },
  );

  it.each(["", "12345", "call me", "0412 345 678 ext nine", "1".repeat(16), "0412-345-678-0412-345-678-0412345"])(
    "rejects %j",
    (phone) => {
      expect(validateField("phone", phone)).not.toBeNull();
    },
  );

  it("explains the problem in plain words", () => {
    expect(validateField("phone", "call me")).toBe("Use digits only: 0412 345 678");
    expect(validateField("phone", "12345")).toBe("Enter a full phone number");
  });
});

describe("other fields", () => {
  it("requires a known facility type", () => {
    expect(validateField("facilityType", "warehouse")).toBeNull();
    expect(validateField("facilityType", "other")).toBeNull();
    expect(validateField("facilityType", "")).toBe("Choose a facility type");
    expect(validateField("facilityType", "castle")).toBe("Choose a facility type");
  });

  it("caps the length of optional fields", () => {
    expect(validateField("company", "x".repeat(120))).toBeNull();
    expect(validateField("company", "x".repeat(121))).not.toBeNull();
    expect(validateField("location", "x".repeat(121))).not.toBeNull();
    expect(validateField("message", "x".repeat(2000))).toBeNull();
    expect(validateField("message", "x".repeat(2001))).toBe("Keep your message under 2,000 characters");
  });
});

describe("cleanEnquiry", () => {
  it("returns every field as a trimmed string", () => {
    expect(cleanEnquiry({ name: "  A  " })).toEqual({
      name: "A",
      company: "",
      email: "",
      phone: "",
      facilityType: "",
      location: "",
      message: "",
    });
  });
});
