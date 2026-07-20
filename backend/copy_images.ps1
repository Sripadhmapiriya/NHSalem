$crab = "C:\Users\Windows\.gemini\antigravity-ide\brain\4b67d565-3752-4f97-9a37-d79a561e502c\crab_image_1784547103819.png"
$lobster = "C:\Users\Windows\.gemini\antigravity-ide\brain\4b67d565-3752-4f97-9a37-d79a561e502c\lobster_image_1784547121715.png"
$dry_fish = "C:\Users\Windows\.gemini\antigravity-ide\brain\4b67d565-3752-4f97-9a37-d79a561e502c\dry_fish_image_1784547139856.png"

$base = "d:\artiowings\NHSalem\backend\public\images"
New-Item -ItemType Directory -Force -Path "$base\dry-fish"
New-Item -ItemType Directory -Force -Path "$base\lobster"
New-Item -ItemType Directory -Force -Path "$base\crabs"

Copy-Item $dry_fish "$base\dry-fish\premium-dried-seerfish-heads.png" -Force
Copy-Item $dry_fish "$base\dry-fish\premium-dried-sardines.jpg" -Force
Copy-Item $dry_fish "$base\dry-fish\traditional-dried-mackerel.png" -Force

Copy-Item $lobster "$base\lobster\premium-sand-lobster.png" -Force
Copy-Item $lobster "$base\lobster\tiger-rock-lobster.png" -Force
Copy-Item $lobster "$base\lobster\spiny-lobster-tails.png" -Force
Copy-Item $lobster "$base\lobster\whole-rock-lobster.png" -Force
Copy-Item $lobster "$base\lobster\bamboo-rock-lobster.png" -Force

Copy-Item $crab "$base\crabs\red-claw-rock-crab.png" -Force
Copy-Item $crab "$base\crabs\soft-shell-mangrove-crab.png" -Force
Copy-Item $crab "$base\crabs\three-spot-crab.png" -Force
Copy-Item $crab "$base\crabs\blue-swimmer-crab.jpg" -Force
Copy-Item $crab "$base\crabs\lagoon-mud-crab.png" -Force
