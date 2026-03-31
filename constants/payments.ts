import { PaymentMethod } from "@/types/models";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "COD",
  "TPay",
  "Mosan",
  "Mandiri",
  "BNU",
  "BNCTL",
  "BNF",
  "BRI",
];

export const PAYMENT_INSTRUCTIONS: Record<PaymentMethod, string> = {
  COD: "Pay in cash upon delivery.",
  TPay: "Open TPay app and transfer to merchant ID: UNIKA-TPAY-001.",
  Mosan: "Send payment to Mosan wallet number: 7700-UNIKA.",
  Mandiri: "Transfer to Mandiri account 1200-1100-8899 a/n Unika Online Shop.",
  BNU: "Transfer to BNU account 3300-2200-1100 a/n Unika Online Shop.",
  BNCTL: "Transfer to BNCTL account 5500-0123-8888 a/n Unika Online Shop.",
  BNF: "Transfer to BNF account 4400-1999-6655 a/n Unika Online Shop.",
  BRI: "Transfer to BRI account 6600-0044-1234 a/n Unika Online Shop.",
};
