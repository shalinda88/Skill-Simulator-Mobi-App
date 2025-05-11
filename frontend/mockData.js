export const userProfile = {
    name: "Alex Rodriguez",
    email: "alex.rodriguez@example.com",
    avatar: "./assets/user.jpg",
    totalProgress: 42,
    completedModules: 3,
    recentSkill: "Street Crossing",
    nextSkillTip: "Practice identifying bus numbers",
    achievements: [
        { name: "First Street Crossing", date: "June 15, 2024" },
        { name: "Shopping Basics Mastered", date: "July 2, 2024" }
    ],
    skillProgress: [
        {
            name: "Crossing Streets",
            progress: 65,
            lastPractice: "July 10, 2024",
            bestScore: 85
        },
        {
            name: "Shopping",
            progress: 35,
            lastPractice: "June 28, 2024",
            bestScore: 70
        },
        {
            name: "Public Transport",
            progress: 25,
            lastPractice: "July 5, 2024",
            bestScore: 60
        }
    ]
};

export const achievementData = [
    {
        icon: "emoji-events",
        title: "First Street Crossing",
        description: "Successfully completed your first street crossing simulation"
    },
    {
        icon: "shopping-cart",
        title: "Shopping Basics",
        description: "Learned basic navigation in a simulated store environment"
    },
    {
        icon: "directions-bus",
        title: "Public Transport Starter",
        description: "Completed initial public transport navigation module"
    }
];