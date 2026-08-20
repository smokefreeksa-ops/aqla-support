# CI-only validation note

The main migration PR currently conflicts with an independently advanced `main` branch. Do not resolve that conflict by merging production changes during feature development.

For validation, compare the current migration head against the last known-green migration checkpoint on an isolated CI baseline branch. This is a testing mechanism only and must not be merged into production.
