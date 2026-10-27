CREATE TABLE "Devices" (
    "Id" uuid NOT NULL,
    "Type" text NOT NULL,
    "Manufacturer" text NOT NULL,
    "Model" text NOT NULL,
    "SerialNumber" text NOT NULL UNIQUE,
    "WarrantyUntil" date NOT NULL,
    CONSTRAINT "PK_Devices" PRIMARY KEY ("Id")
);
