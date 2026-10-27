DELETE FROM "Measurements";
DELETE FROM "Devices";
DELETE FROM "Installations";

INSERT INTO "Installations" ("Id", "Name", "Address", "Latitude", "Longitude", "InstallationDate", "RatedPowerKw") VALUES
  ('11111111-1111-1111-1111-111111111111', 'Hiša Novak', 'Cesta v Mestni log 10, Ljubljana', 46.034500, 14.489200, '2023-05-12', 8.40),
  ('22222222-2222-2222-2222-222222222222', 'Kmetija Kovač', 'Pohorska ulica 5, Maribor', 46.554700, 15.645900, '2022-08-03', 12.60);

INSERT INTO "Devices" ("Id", "InstallationId", "Type", "Manufacturer", "Model", "SerialNumber", "WarrantyUntil") VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Panel', 'JA Solar', 'JAM54S30-420', 'JA-2305-0142', '2035-05-12'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Inverter', 'Fronius', 'Primo 8.2-1', 'FR-2305-7781', '2028-05-12'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Panel', 'Trina Solar', 'Vertex S 425', 'TR-2208-3320', '2034-08-03'),
  ('aaaaaaaa-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Inverter', 'SMA', 'Sunny Tripower 12', 'SMA-2208-5516', '2026-11-20');

INSERT INTO "Measurements" ("Id", "DeviceId", "Timestamp", "ProductionKwh", "Temperature", "HasError")
SELECT
  gen_random_uuid(),
  s."DeviceId",
  s.ts,
  CASE WHEN s.err THEN round((s.kw * s.f * 0.1)::numeric, 3) ELSE round((s.kw * s.f * (0.75 + 0.25 * s.r1))::numeric, 3) END,
  round((CASE WHEN s."Type" = 'Panel' THEN 8 + 14 * s.f ELSE 30 + 12 * s.f END + 2 * s.r2)::numeric, 2),
  s.err
FROM (
  SELECT
    d."Id" AS "DeviceId",
    d."Type",
    i."RatedPowerKw"::float AS kw,
    t.ts,
    CASE WHEN extract(hour FROM t.ts AT TIME ZONE 'Europe/Ljubljana') BETWEEN 7 AND 18
      THEN sin(pi() * (extract(hour FROM t.ts AT TIME ZONE 'Europe/Ljubljana') - 6) / 13.0) ELSE 0 END AS f,
    random() AS r1,
    random() AS r2,
    random() < 0.02 AS err
  FROM "Devices" d
  JOIN "Installations" i ON i."Id" = d."InstallationId"
  CROSS JOIN generate_series(date_trunc('hour', now()) - interval '191 hours', date_trunc('hour', now()), interval '1 hour') AS t(ts)
) s;
