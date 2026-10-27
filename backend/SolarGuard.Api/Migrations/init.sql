CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "Installations" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Address" text NOT NULL,
    "Latitude" numeric(9,6) NOT NULL,
    "Longitude" numeric(9,6) NOT NULL,
    "InstallationDate" date NOT NULL,
    "RatedPowerKw" numeric(10,2) NOT NULL,
    CONSTRAINT "PK_Installations" PRIMARY KEY ("Id")
);

CREATE TABLE "Devices" (
    "Id" uuid NOT NULL,
    "InstallationId" uuid NOT NULL,
    "Type" text NOT NULL,
    "Manufacturer" text NOT NULL,
    "Model" text NOT NULL,
    "SerialNumber" text NOT NULL,
    "WarrantyUntil" date NOT NULL,
    CONSTRAINT "PK_Devices" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Devices_Installations_InstallationId" FOREIGN KEY ("InstallationId") REFERENCES "Installations" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Measurements" (
    "Id" uuid NOT NULL,
    "DeviceId" uuid NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL,
    "ProductionKwh" numeric(12,3) NOT NULL,
    "Temperature" numeric(6,2) NOT NULL,
    "HasError" boolean NOT NULL,
    CONSTRAINT "PK_Measurements" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Measurements_Devices_DeviceId" FOREIGN KEY ("DeviceId") REFERENCES "Devices" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_Devices_InstallationId" ON "Devices" ("InstallationId");

CREATE INDEX "IX_Measurements_DeviceId_Timestamp" ON "Measurements" ("DeviceId", "Timestamp");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20261015205423_Init', '10.0.13');

COMMIT;

