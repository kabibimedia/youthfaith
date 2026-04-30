<?php

namespace Database\Seeders;

use App\Models\Quiz;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $quizzes = [
            [
                'title' => 'Who created the world?',
                'question' => 'In the beginning, who created the heavens and the earth?',
                'options' => ['Moses', 'God', 'Jesus', 'Adam'],
                'correct_answer' => 1,
                'points' => 10,
            ],
            [
                'title' => 'The Greatest Commandment',
                'question' => 'What is the greatest commandment according to Jesus?',
                'options' => ['Love your neighbor', 'Love the Lord your God', 'Pray every day', 'Go to church'],
                'correct_answer' => 1,
                'points' => 10,
            ],
            [
                'title' => 'Who was swallowed by a big fish?',
                'question' => 'Which prophet was swallowed by a big fish for three days?',
                'options' => ['Elijah', 'Jonah', 'Moses', 'David'],
                'correct_answer' => 1,
                'points' => 10,
            ],
            [
                'title' => 'The Beatitudes',
                'question' => 'Which group of people did Jesus say are blessed in the Sermon on the Mount?',
                'options' => ['The rich', 'The poor in spirit', 'The powerful', 'The famous'],
                'correct_answer' => 1,
                'points' => 10,
            ],
            [
                'title' => 'The Fruits of the Spirit',
                'question' => 'Which of the following is NOT one of the Fruits of the Spirit?',
                'options' => ['Love', 'Patience', 'Jealousy', 'Kindness'],
                'correct_answer' => 2,
                'points' => 10,
            ],
            [
                'title' => 'The Lord\'s Prayer',
                'question' => 'In the Lord\'s Prayer, what comes after "Our Father who art in heaven"?',
                'options' => ['Give us this day our daily bread', 'Hallowed be thy name', 'For thine is the kingdom', 'We give thanks to thee'],
                'correct_answer' => 1,
                'points' => 10,
            ],
            [
                'title' => 'Who walked on water?',
                'question' => 'Who walked on water towards Jesus during a storm?',
                'options' => ['Peter', 'John', 'James', 'Andrew'],
                'correct_answer' => 0,
                'points' => 10,
            ],
            [
                'title' => 'The Ten Commandments',
                'question' => 'How many commandments did God give to Moses?',
                'options' => ['5', '7', '10', '12'],
                'correct_answer' => 2,
                'points' => 10,
            ],
            [
                'title' => 'Who was the first man?',
                'question' => 'Who was the first man created by God?',
                'options' => ['Adam', 'Noah', 'Abraham', 'Moses'],
                'correct_answer' => 0,
                'points' => 10,
            ],
            [
                'title' => 'The Promised Land',
                'question' => 'Which land did God promise to Abraham and his descendants?',
                'options' => ['Egypt', 'Canaan/Israel', 'Babylon', 'Rome'],
                'correct_answer' => 1,
                'points' => 10,
            ],
        ];

        foreach ($quizzes as $quiz) {
            Quiz::create($quiz);
        }
    }
}
