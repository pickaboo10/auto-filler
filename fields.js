/**
 * fields.js — Central field configuration for AutoFill Extension.
 *
 * Each entry defines:
 *   id       – storage key & DOM element id suffix
 *   label    – human-readable label
 *   type     – HTML input type (text | email | tel | url | select | date)
 *   variants – lowercase keywords used by content.js for matching
 */
var FIELDS_CONFIG = [
  {
    id: "firstName",
    label: "First Name",
    type: "text",
    variants: [
      "firstname", "first_name", "fname", "given-name",
      "givenname", "given_name", "first-name", "forename"
    ]
  },
  {
    id: "lastName",
    label: "Last Name",
    type: "text",
    variants: [
      "lastname", "last_name", "lname", "family-name",
      "familyname", "family_name", "last-name", "surname", "sname"
    ]
  },
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    variants: [
      "fullname", "full_name", "full-name", "name",
      "yourname", "your_name", "displayname", "display_name"
    ]
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    variants: [
      "email", "e-mail", "emailaddress", "email_address",
      "email-address", "useremail", "user_email", "mail"
    ]
  },
  {
    id: "phone",
    label: "Phone",
    type: "tel",
    variants: [
      "phone", "phonenumber", "phone_number", "phone-number",
      "mobile", "mobilenumber", "mobile_number", "tel",
      "telephone", "cell", "cellphone", "contact_number"
    ]
  },
  {
    id: "addressLine1",
    label: "Address Line 1",
    type: "text",
    variants: [
      "address", "address1", "address_1", "address-1",
      "addressline1", "address_line1", "street",
      "streetaddress", "street_address", "street-address"
    ]
  },
  {
    id: "addressLine2",
    label: "Address Line 2",
    type: "text",
    variants: [
      "address2", "address_2", "address-2",
      "addressline2", "address_line2", "apt",
      "apartment", "suite", "unit"
    ]
  },
  {
    id: "city",
    label: "City",
    type: "text",
    variants: [
      "city", "town", "cityname", "city_name",
      "city-name", "locality", "suburb", "district"
    ]
  },
  {
    id: "state",
    label: "State",
    type: "text",
    variants: [
      "state", "province", "region", "statename",
      "state_name", "state-name", "county", "territory"
    ]
  },
  {
    id: "zipCode",
    label: "Zip/Postal Code",
    type: "text",
    variants: [
      "zip", "zipcode", "zip_code", "zip-code",
      "postal", "postalcode", "postal_code", "postal-code",
      "postcode", "post_code"
    ]
  },
  {
    id: "country",
    label: "Country",
    type: "text",
    variants: [
      "country", "countryname", "country_name", "country-name",
      "nation", "nationality", "countrycode", "country_code"
    ]
  },
  {
    id: "linkedIn",
    label: "LinkedIn URL",
    type: "url",
    variants: [
      "linkedin", "linkedinurl", "linkedin_url", "linkedin-url",
      "linkedinprofile", "linkedin_profile", "linkedin-profile",
      "linkedinlink", "linkedin_link"
    ]
  },
  {
    id: "gitHub",
    label: "GitHub URL",
    type: "url",
    variants: [
      "github", "githuburl", "github_url", "github-url",
      "githubprofile", "github_profile", "github-profile",
      "githublink", "github_link", "githubpage", "github_page"
    ]
  },
  {
    id: "gender",
    label: "Gender",
    type: "select",
    variants: [
      "gender", "sex", "genderidentity", "gender_identity",
      "gender-identity", "biologicalsex", "biological_sex"
    ]
  },
  {
    id: "dateOfBirth",
    label: "Date of Birth",
    type: "date",
    variants: [
      "dob", "dateofbirth", "date_of_birth", "date-of-birth",
      "birthdate", "birth_date", "birth-date",
      "birthday", "birth_day", "bday"
    ]
  }
];
