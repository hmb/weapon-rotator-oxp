#!/bin/bash

TARGET_DIR="/D/holger/test"

NAME=$(grep "CFBundleName" Info.plist |
  sed "s+.*<string>\(.*\)</string>.*+\1+" |
  sed "s/ /-/g")
VERSION=$(grep "CFBundleShortVersionString" Info.plist |
  sed "s+.*<string>\(.*\)</string>.*+\1+" |
  sed "s/ /-/g")
DATE=$(date +%F)

FOLDERNAME="${NAME}_${VERSION}_${DATE}"
FOLDERNAME_OXP="${FOLDERNAME}.oxp"
FOLDERNAME_DEV="$(basename $(pwd))"

echo "${FOLDERNAME}"
echo "${FOLDERNAME_OXP}"
echo "${FOLDERNAME_DEV}"

echo "${TARGET_DIR}"

#set -x

mkdir -p "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}"
cp -a * "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}"
rm "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}/deploy.sh"
rm "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}/TechSpecs.txt"
mv "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}/ReadMe.txt" \
   "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}/${NAME}_ReadMe.txt"
cp "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}/${NAME}_ReadMe.txt" \
   "${TARGET_DIR}/${FOLDERNAME}/"
mv -v "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}/License.txt" \
      "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}/${NAME}_License.txt"
cp -v "${TARGET_DIR}/${FOLDERNAME}/${FOLDERNAME_OXP}/${NAME}_License.txt" \
      "${TARGET_DIR}/${FOLDERNAME}/"
