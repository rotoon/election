-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'ec', 'voter');

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "national_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'voter',
    "constituency_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constituencies" (
    "id" SERIAL NOT NULL,
    "province" TEXT NOT NULL,
    "zone_number" INTEGER NOT NULL,
    "is_poll_open" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "constituencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL DEFAULT '',
    "policy" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#3B82F6',

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "candidate_number" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL DEFAULT '',
    "personal_policy" TEXT NOT NULL DEFAULT '',
    "party_id" INTEGER NOT NULL,
    "constituency_id" INTEGER NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "constituency_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_national_id_key" ON "profiles"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "constituencies_province_zone_number_key" ON "constituencies"("province", "zone_number");

-- CreateIndex
CREATE UNIQUE INDEX "parties_name_key" ON "parties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_constituency_id_candidate_number_key" ON "candidates"("constituency_id", "candidate_number");

-- CreateIndex
CREATE UNIQUE INDEX "votes_user_id_constituency_id_key" ON "votes"("user_id", "constituency_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_constituency_id_fkey" FOREIGN KEY ("constituency_id") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_constituency_id_fkey" FOREIGN KEY ("constituency_id") REFERENCES "constituencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_constituency_id_fkey" FOREIGN KEY ("constituency_id") REFERENCES "constituencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
