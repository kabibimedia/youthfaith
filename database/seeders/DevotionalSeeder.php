<?php

namespace Database\Seeders;

use App\Models\Devotional;
use Illuminate\Database\Seeder;

class DevotionalSeeder extends Seeder
{
    public function run(): void
    {
        $devotionals = [
            [
                'title' => 'Trust in the Lord',
                'content' => 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight. (Proverbs 3:5-6)

When we face challenges and uncertainties, it can be tempting to rely on our own understanding and try to figure everything out ourselves. But God wants us to trust Him completely.

Today, take a moment to surrender your worries to God. Trust that He is working behind the scenes for your good. His plans for you are greater than your own.',
                'verse' => 'Proverbs 3:5-6',
                'devotional_date' => now()->toDateString(),
            ],
            [
                'title' => 'God\'s Love Never Fails',
                'content' => 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. (1 Corinthians 13:4-5)

God\'s love is perfect and unconditional. No matter what you\'ve done or where you\'ve been, His love is always there waiting for you.

Today, reflect on how much God loves you. Let that love fill your heart and overflow to others around you.',
                'verse' => '1 Corinthians 13:4-5',
                'devotional_date' => now()->subDay()->toDateString(),
            ],
            [
                'title' => 'Be Bold in Your Faith',
                'content' => 'Be on your guard; stand firm in the faith; be courageous; be strong. (1 Corinthians 16:13)

Being a young believer in today\'s world isn\'t always easy. You might face pressure to compromise your values or feel alone in your walk of faith.

Remember that God is with you! Be bold in standing up for what you believe. Your faith is your superpower.',
                'verse' => '1 Corinthians 16:13',
                'devotional_date' => now()->subDays(2)->toDateString(),
            ],
            [
                'title' => 'Finding Peace in Chaos',
                'content' => 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid. (John 14:27)

In the middle of school pressures, family issues, and life\'s chaos, Jesus offers you a peace that surpasses all understanding.

When you feel overwhelmed, take a breath and remember: God\'s peace is available to you right now.',
                'verse' => 'John 14:27',
                'devotional_date' => now()->subDays(3)->toDateString(),
            ],
            [
                'title' => 'You Are Made for Purpose',
                'content' => 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do. (Ephesians 2:10)

You are not an accident. God created you with a specific purpose in mind. He has good works prepared for you to do.

Today, ask God to show you how He wants to use you. Your gifts and talents are meant to make a difference!',
                'verse' => 'Ephesians 2:10',
                'devotional_date' => now()->subDays(4)->toDateString(),
            ],
        ];

        foreach ($devotionals as $devotional) {
            Devotional::create($devotional);
        }
    }
}
