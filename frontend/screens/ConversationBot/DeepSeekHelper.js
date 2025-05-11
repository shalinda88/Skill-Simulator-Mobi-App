import axios from 'axios';

class DeepSeekHelper{
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';


        this.contexts = {
            'en-US': 'You are a helpful, friendly assistant for primary school students with visual impairments. ' +
                'Provide simple, clear explanations. Use concrete examples. ' +
                'Focus on being educational and supportive.',

            'si-LK': 'ඔබ දෘශ්‍යාබාධිත ප්‍රාථමික පාසල් සිසුන් සඳහා උපකාරක, මිත්‍රශීලී සහකරුවෙකි. ' +
                'සරල, පැහැදිලි පැහැදිලි කිරීම් සපයන්න. සරල උදාහරණ භාවිතා කරන්න. ' +
                'අධ්‍යාපනික හා සහායක වීම කෙරෙහි අවධානය යොමු කරන්න.',

            'ta-LK': 'நீங்கள் பார்வை குறைபாடுள்ள ஆரம்ப பள்ளி மாணவர்களுக்கான உதவிகரமான, நட்பான உதவியாளர். ' +
                'எளிமையான, தெளிவான விளக்கங்களை வழங்குங்கள். உறுதியான எடுத்துக்காட்டுகளைப் பயன்படுத்துங்கள். ' +
                'கல்வி மற்றும் ஆதரவாக இருப்பதில் கவனம் செலுத்துங்கள்.'
        };
    }

    async generateResponse(message, languageCode = 'en-US') {
        try {
            const context = this.contexts[languageCode] || this.contexts['en-US'];

            const response = await axios.post(
                this.apiUrl,
                {
                    model: "deepseek-chat",
                    messages: [
                        { role: 'system', content: context },
                        { role: 'user', content: message },
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling DeepSeek API:', error);
            const errorMessages = {
                'en-US': "I'm sorry, I couldn't understand that. Could you please try again?",
                'si-LK': 'සමාවෙන්න, මට ඒක තේරුම් ගන්න බැරි වුණා. කරුණාකර නැවත උත්සාහ කරන්න?',
                'ta-LK': 'மன்னிக்கவும், எனக்கு அது புரியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவா?'
            };
            return errorMessages[languageCode] || errorMessages['en-US'];
        }
    }

    detectLanguage(text){
        const sinhalaPattern = /[\u0D80-\u0DFF]/;
        const tamilPattern = /[\u0B80-\u0BFF]/;

        if (sinhalaPattern.test(text)) return 'si-LK';
        if (tamilPattern.test(text)) return 'ta-LK';
        return 'en-US';
    }
}

export default DeepSeekHelper