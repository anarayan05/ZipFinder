

/* CREATE TABLE "sample_zips" (
    "Zip" INTEGER,
    "population" INTEGER,
    "density" REAL,
    "City" TEXT,
    "St" TEXT,
    "State" TEXT,
    "CitySt" TEXT,
    "County" TEXT,
    "Country" TEXT,
    "Coordinates" TEXT,
    "lat" REAL,
    "long" REAL
); */

/* INSERT INTO sample_zips SELECT * FROM your_table_name;
 */

INSERT INTO sample_zips
SELECT *
FROM your_table_name
WHERE ROWID % 100 = 0;

