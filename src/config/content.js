// =====================================================================
// Editable copy for the Story, Ceremonies, Travel & Stay and FAQ sections.
// Every text is { en, ta, te }; a missing language falls back to English.
// Tamil / Telugu text is machine-drafted — please have a native speaker review.
// =====================================================================

// ------------------------------------------------------------ Our Story
export const story = {
  kicker: { en: 'Our Story', ta: 'எங்கள் கதை', te: 'మా కథ' },
  title: {
    en: ['From a slice of pizza', 'to forever'],
    ta: ['ஒரு பீட்சா துண்டிலிருந்து', 'என்றென்றும்'],
    te: ['ఒక పిజ్జా ముక్క నుండి', 'శాశ్వతంగా'],
  },
  lead: {
    en: 'Two people, two cultures, one table at a Pizza Hut in Australia. Here is how a friendship quietly became the love of our lives.',
    ta: 'இருவர், இரு கலாசாரங்கள், ஆஸ்திரேலியாவில் ஒரு Pizza Hut மேசை. ஒரு நட்பு எப்படி எங்கள் வாழ்வின் காதலானது என்பது இதோ.',
    te: 'ఇద్దరు వ్యక్తులు, రెండు సంస్కృతులు, ఆస్ట్రేలియాలోని ఒక Pizza Hut టేబుల్. ఒక స్నేహం ఎలా మా జీవితపు ప్రేమగా మారిందో ఇదిగో.',
  },
  engagementLink: { en: 'Relive our engagement', ta: 'எங்கள் நிச்சயதார்த்தம்', te: 'మా నిశ్చితార్థం చూడండి' },
  // Add a photo to any milestone: photo: '/assets/story/01.jpg'
  milestones: [
    {
      when: { en: 'Australia', ta: 'ஆஸ்திரேலியா', te: 'ఆస్ట్రేలియా' },
      icon: '🍕',
      title: { en: 'A slice of fate', ta: 'விதியின் ஒரு துண்டு', te: 'విధి ఒక ముక్క' },
      text: {
        en: 'Far from home, our paths crossed at a Pizza Hut. Neither of us knew that an ordinary evening would become the first page of our story.',
        ta: 'வீட்டிலிருந்து வெகு தொலைவில், ஒரு Pizza Hut-இல் எங்கள் பாதைகள் சந்தித்தன. ஒரு சாதாரண மாலை எங்கள் கதையின் முதல் பக்கமாகும் என்று நாங்கள் அறியவில்லை.',
        te: 'ఇంటికి దూరంగా, ఒక Pizza Hut లో మా దారులు కలిశాయి. ఒక సాధారణ సాయంత్రం మా కథలో మొదటి పేజీ అవుతుందని మాకు తెలియదు.',
      },
      photo: null,
    },
    {
      when: { en: 'Then', ta: 'பிறகு', te: 'ఆ తర్వాత' },
      icon: '🤝',
      title: { en: 'Friends first', ta: 'முதலில் நண்பர்கள்', te: 'ముందుగా స్నేహితులు' },
      text: {
        en: 'Shared meals, long conversations and a lot of laughter. Somewhere between the jokes and the late-night talks, we became each other’s favourite person.',
        ta: 'பகிர்ந்த உணவுகள், நீண்ட உரையாடல்கள், நிறைய சிரிப்பு. அவற்றிற்கு இடையில் நாங்கள் ஒருவருக்கொருவர் மிகப் பிடித்தவர்களானோம்.',
        te: 'కలిసి భోజనాలు, సుదీర్ఘ సంభాషణలు, ఎంతో నవ్వు. వాటి మధ్యలో మేము ఒకరికొకరు అత్యంత ఇష్టమైన వ్యక్తులమయ్యాం.',
      },
      photo: null,
    },
    {
      when: { en: 'Slowly, surely', ta: 'மெல்ல, உறுதியாக', te: 'మెల్లగా, ఖచ్చితంగా' },
      icon: '💞',
      title: { en: 'From friends to forever', ta: 'நட்பிலிருந்து என்றென்றும்', te: 'స్నేహం నుండి శాశ్వతం వరకు' },
      text: {
        en: 'Friendship turned into something deeper. A Telugu heart and a Tamil heart found they spoke the same language after all.',
        ta: 'நட்பு ஆழமான ஒன்றாக மாறியது. ஒரு தெலுங்கு இதயமும் ஒரு தமிழ் இதயமும் ஒரே மொழியைப் பேசுவதைக் கண்டன.',
        te: 'స్నేహం మరింత లోతైనదిగా మారింది. ఒక తెలుగు హృదయం, ఒక తమిళ హృదయం ఒకే భాష మాట్లాడుతున్నాయని తెలుసుకున్నాయి.',
      },
      photo: null,
    },
    {
      when: { en: 'March 2025', ta: 'மார்ச் 2025', te: 'మార్చి 2025' },
      icon: '💍',
      title: { en: 'The engagement', ta: 'நிச்சயதார்த்தம்', te: 'నిశ్చితార్థం' },
      text: {
        en: 'With our families’ blessings we made it official, surrounded by the people we love most.',
        ta: 'எங்கள் குடும்பங்களின் ஆசீர்வாதத்துடன், நாங்கள் மிகவும் நேசிப்பவர்கள் சூழ, இதை அதிகாரப்பூர்வமாக்கினோம்.',
        te: 'మా కుటుంబాల ఆశీర్వాదంతో, మేము ఎక్కువగా ప్రేమించే వారి మధ్య దీనిని అధికారికం చేశాం.',
      },
      photo: null,
      link: '/engagement/',
    },
    {
      when: { en: 'Ballari & Colombo', ta: 'பல்லாரி & கொழும்பு', te: 'బళ్లారి & కొలంబో' },
      icon: '🪷',
      title: { en: 'Two families, one celebration', ta: 'இரு குடும்பங்கள், ஒரு கொண்டாட்டம்', te: 'రెండు కుటుంబాలు, ఒకే వేడుక' },
      text: {
        en: 'Haldi, Mehendi and the wedding in Ballari, then a reception in Colombo, so both our homes can celebrate with us.',
        ta: 'பல்லாரியில் ஹல்தி, மெஹந்தி, திருமணம்; பின்னர் கொழும்பில் வரவேற்பு. எங்கள் இரு வீடுகளும் எங்களுடன் கொண்டாட.',
        te: 'బళ్లారిలో హల్దీ, మెహందీ, పెళ్లి; ఆ తర్వాత కొలంబోలో రిసెప్షన్. మా రెండు ఇళ్లూ మాతో కలిసి వేడుక చేసుకోవడానికి.',
      },
      photo: null,
    },
    {
      when: { en: '14 · 02 · 2027', ta: '14 · 02 · 2027', te: '14 · 02 · 2027' },
      icon: '🪔',
      title: { en: 'Forever begins', ta: 'என்றென்றும் தொடங்குகிறது', te: 'శాశ్వతం మొదలవుతుంది' },
      text: {
        en: 'And the best chapter is the one we’ll write with you there. We can’t wait to celebrate together.',
        ta: 'சிறந்த அத்தியாயம் நீங்கள் உடனிருக்க நாங்கள் எழுதப்போவது. உங்களுடன் கொண்டாடக் காத்திருக்கிறோம்.',
        te: 'అత్యుత్తమ అధ్యాయం మీరు మాతో ఉండగా మేము రాసేదే. మీతో కలిసి వేడుక చేసుకోవడానికి ఎదురుచూస్తున్నాం.',
      },
      photo: null,
      final: true,
    },
  ],
};

// ------------------------------------------------------------ Ceremonies guide
const L = (en, ta, te) => ({ en, ta, te });

export const ceremonies = {
  kicker: L('The Ceremonies', 'சடங்குகள்', 'వేడుకలు'),
  title: { en: ['A guide to', 'each ritual'], ta: ['ஒவ்வொரு சடங்கிற்கும்', 'ஒரு வழிகாட்டி'], te: ['ప్రతి వేడుకకు', 'ఒక మార్గదర్శి'] },
  lead: L(
    'New to a South Indian wedding? Here is what each celebration means, what will happen, and what to wear.',
    'தென்னிந்தியத் திருமணத்திற்குப் புதியவரா? ஒவ்வொரு கொண்டாட்டத்தின் பொருள், என்ன நடக்கும், என்ன அணிவது என்பது இங்கே.',
    'దక్షిణ భారత వివాహం మీకు కొత్తా? ప్రతి వేడుక అర్థం, ఏం జరుగుతుంది, ఏం ధరించాలి అన్నది ఇక్కడ ఉంది.',
  ),
  labels: {
    meaning: L('What it means', 'பொருள்', 'అర్థం'),
    expect: L('What to expect', 'என்ன நடக்கும்', 'ఏం జరుగుతుంది'),
    wear: L('What to wear', 'என்ன அணிவது', 'ఏం ధరించాలి'),
    rituals: L('Key moments', 'முக்கிய தருணங்கள்', 'ముఖ్య ఘట్టాలు'),
    note: L(
      'Rituals vary between families and priests, so the order on the day may differ a little.',
      'சடங்குகள் குடும்பத்திற்குக் குடும்பம் மாறுபடலாம்; அன்றைய வரிசை சற்று மாறலாம்.',
      'ఆచారాలు కుటుంబాన్ని బట్టి మారవచ్చు; ఆ రోజు క్రమం కొద్దిగా మారవచ్చు.',
    ),
  },
  // keyed by event id from src/config/wedding.js
  items: {
    'bride-haldi': {
      tab: L('Haldi', 'ஹல்தி', 'హల్దీ'),
      sub: L('Bride’s Haldi', 'மணமகள் ஹல்தி', 'వధువు హల్దీ'),
      meaning: L(
        'A paste of turmeric, sandalwood and rose water is applied to the bride by family and friends. It is said to bless, purify and bring a glow before the wedding.',
        'மஞ்சள், சந்தனம், பன்னீர் கலந்த விழுது மணமகளுக்குக் குடும்பத்தினரும் நண்பர்களும் பூசுவர். இது ஆசீர்வாதமும் பொலிவும் தரும் என்பது நம்பிக்கை.',
        'పసుపు, చందనం, పన్నీరు కలిపిన మిశ్రమాన్ని కుటుంబ సభ్యులు, స్నేహితులు వధువుకు పూస్తారు. ఇది ఆశీర్వాదం, కాంతినిస్తుందని నమ్మకం.',
      ),
      expect: L(
        'A joyful, informal morning: music, laughter and a lot of yellow. Expect to get a little turmeric on you!',
        'இசை, சிரிப்பு, நிறைய மஞ்சள் நிறைந்த மகிழ்ச்சியான காலை. உங்கள் மீதும் கொஞ்சம் மஞ்சள் படலாம்!',
        'సంగీతం, నవ్వులు, ఎంతో పసుపుతో ఆనందభరితమైన ఉదయం. మీ మీద కూడా కొంచెం పసుపు పడొచ్చు!',
      ),
    },
    mehendi: {
      tab: L('Mehendi', 'மெஹந்தி', 'మెహందీ'),
      sub: L('Henna evening', 'மருதாணி மாலை', 'గోరింటాకు సాయంత్రం'),
      meaning: L(
        'Intricate henna designs are drawn on the bride’s hands and feet. Tradition says the deeper the colour, the deeper the love. The groom’s initials are often hidden in the pattern.',
        'மணமகளின் கைகளிலும் கால்களிலும் நுணுக்கமான மருதாணி வரையப்படும். நிறம் ஆழமானால் அன்பும் ஆழம் என்பது மரபு.',
        'వధువు చేతులు, పాదాలపై అందమైన గోరింటాకు డిజైన్లు వేస్తారు. రంగు ఎంత ముదురైతే ప్రేమ అంత గాఢం అని సంప్రదాయం.',
      ),
      expect: L(
        'A relaxed, colourful evening with music and dancing. Henna artists will be there for guests too, so come with your hands free!',
        'இசையும் நடனமும் நிறைந்த வண்ணமயமான மாலை. விருந்தினர்களுக்கும் மருதாணி போடுவார்கள்!',
        'సంగీతం, నృత్యంతో రంగుల సాయంత్రం. అతిథులకు కూడా గోరింటాకు పెడతారు!',
      ),
    },
    'groom-haldi': {
      tab: L('Groom’s Haldi', 'மணமகன் ஹல்தி', 'వరుడి హల్దీ'),
      sub: L('Pellikoduku', 'மணமகன் சடங்கு', 'పెళ్లికొడుకు'),
      meaning: L(
        'The groom’s own turmeric ceremony. In Telugu homes this is part of making him “Pellikoduku”, the bridegroom, with blessings from the elders.',
        'மணமகனின் மஞ்சள் சடங்கு. தெலுங்கு வீடுகளில் பெரியவர்களின் ஆசீர்வாதத்துடன் அவரை “பெள்ளிகொடுகு” ஆக்கும் சடங்கின் பகுதி.',
        'వరుడి పసుపు వేడుక. తెలుగు ఇళ్లలో పెద్దల ఆశీర్వాదంతో అతన్ని “పెళ్లికొడుకు”గా చేసే వేడుకలో భాగం.',
      ),
      expect: L(
        'Family, music and turmeric: a fun morning before the evening reception.',
        'குடும்பம், இசை, மஞ்சள்: மாலை வரவேற்புக்கு முன் ஒரு மகிழ்ச்சியான காலை.',
        'కుటుంబం, సంగీతం, పసుపు: సాయంత్రం రిసెప్షన్ ముందు సరదా ఉదయం.',
      ),
    },
    'reception-india': {
      tab: L('Reception', 'வரவேற்பு', 'రిసెప్షన్'),
      sub: L('Ballari reception', 'பல்லாரி வரவேற்பு', 'బళ్లారి రిసెప్షన్'),
      meaning: L(
        'An evening to welcome everyone, meet the couple and celebrate together on the eve of the wedding.',
        'திருமணத்திற்கு முந்தைய மாலை அனைவரையும் வரவேற்று, தம்பதியரைச் சந்தித்து ஒன்றாகக் கொண்டாடும் நேரம்.',
        'పెళ్లికి ముందు రోజు సాయంత్రం అందరినీ ఆహ్వానించి, జంటను కలిసి కలిసి వేడుక చేసుకునే సమయం.',
      ),
      expect: L(
        'Dinner, music and photographs with the couple. Dress up: festive or formal both work.',
        'விருந்து, இசை, தம்பதியருடன் புகைப்படங்கள். பண்டிகை அல்லது முறையான உடை இரண்டும் பொருத்தம்.',
        'విందు, సంగీతం, జంటతో ఫోటోలు. పండుగ లేదా ఫార్మల్ దుస్తులు రెండూ సరే.',
      ),
      wear: L('Festive or smart formal', 'பண்டிகை / முறையான உடை', 'పండుగ / ఫార్మల్ దుస్తులు'),
    },
    wedding: {
      tab: L('Wedding', 'திருமணம்', 'పెళ్లి'),
      sub: L('The Muhurtham', 'முகூர்த்தம்', 'ముహూర్తం'),
      meaning: L(
        'The sacred wedding at the auspicious hour (muhurtham), drawing on both Telugu and Tamil traditions, with Vedic chants and the blessings of the elders.',
        'சுப நேரத்தில் (முகூர்த்தம்) நடைபெறும் புனிதத் திருமணம்: தெலுங்கு, தமிழ் மரபுகள் இரண்டும், வேத மந்திரங்கள், பெரியோர் ஆசீர்வாதம்.',
        'శుభ ముహూర్తంలో జరిగే పవిత్ర వివాహం: తెలుగు, తమిళ సంప్రదాయాలు, వేద మంత్రాలు, పెద్దల ఆశీర్వాదం.',
      ),
      expect: L(
        'A morning ceremony of a few hours. Guests are welcome to come and go quietly, and the key moments are announced. Lunch follows.',
        'சில மணி நேரக் காலைச் சடங்கு. முக்கிய தருணங்கள் அறிவிக்கப்படும். பின்னர் மதிய விருந்து.',
        'కొన్ని గంటల ఉదయం వేడుక. ముఖ్య ఘట్టాలు ప్రకటిస్తారు. తర్వాత మధ్యాహ్న భోజనం.',
      ),
      rituals: [
        { name: L('Kashi Yatra', 'காசி யாத்திரை', 'కాశీ యాత్ర'), text: L('The groom playfully sets off for a life of study and renunciation, until the bride’s family persuades him to marry instead.', 'மணமகன் துறவு வாழ்க்கைக்குப் புறப்படுவது போல் நடிக்க, மணமகள் குடும்பம் அவரைத் திருமணத்திற்கு அழைக்கிறது.', 'వరుడు సన్యాసానికి బయలుదేరినట్లు నటిస్తే, వధువు కుటుంబం పెళ్లికి ఒప్పిస్తుంది.') },
        { name: L('Kanyadaanam', 'கன்யாதானம்', 'కన్యాదానం'), text: L('The bride’s parents place her hand in the groom’s, entrusting their daughter to him with their blessings.', 'மணமகளின் பெற்றோர் அவளின் கையை மணமகனின் கையில் ஒப்படைத்து ஆசீர்வதிக்கின்றனர்.', 'వధువు తల్లిదండ్రులు ఆమె చేతిని వరుడి చేతిలో ఉంచి ఆశీర్వదిస్తారు.') },
        { name: L('Jeelakarra-Bellam', 'சீரகம்-வெல்லம்', 'జీలకర్ర-బెల్లం'), text: L('At the muhurtham, a paste of cumin and jaggery is placed on each other’s heads: life’s bitter and sweet, shared and inseparable.', 'முகூர்த்தத்தில் சீரகம்-வெல்லக் கலவையை ஒருவர் தலையில் ஒருவர் வைப்பர்: வாழ்வின் கசப்பும் இனிப்பும் பிரிக்க முடியாதவை.', 'ముహూర్తంలో జీలకర్ర-బెల్లం ఒకరి తలపై ఒకరు ఉంచుతారు: జీవితంలోని చేదు, తీపి కలిసే ఉంటాయి.') },
        { name: L('Mangalsutra / Thaali', 'தாலி', 'మంగళసూత్రం'), text: L('The groom ties the sacred thread around the bride’s neck as everyone showers the couple with blessings.', 'அனைவரும் அட்சதை தூவ, மணமகன் மணமகளின் கழுத்தில் தாலி கட்டுகிறார்.', 'అందరూ అక్షింతలు చల్లుతుండగా వరుడు వధువు మెడలో మంగళసూత్రం కడతాడు.') },
        { name: L('Talambralu', 'தலம்பராலு', 'తలంబ్రాలు'), text: L('The couple pour turmeric-coloured rice over each other, a joyful and often competitive wish for abundance.', 'தம்பதியர் ஒருவர் மீது ஒருவர் மஞ்சள் அரிசி தூவுவர்: செழிப்பிற்கான மகிழ்ச்சியான வாழ்த்து.', 'దంపతులు ఒకరిపై ఒకరు పసుపు బియ్యం పోసుకుంటారు: సమృద్ధి కోసం ఆనందకరమైన ఆకాంక్ష.') },
        { name: L('Saptapadi', 'சப்தபதி', 'సప్తపది'), text: L('Seven steps taken together around the sacred fire, each one a vow for their life together.', 'புனித அக்னியைச் சுற்றி ஏழு அடிகள்: ஒவ்வொன்றும் ஒரு வாக்குறுதி.', 'పవిత్ర అగ్ని చుట్టూ ఏడు అడుగులు: ప్రతి అడుగు ఒక ప్రమాణం.') },
      ],
    },
    'reception-colombo': {
      tab: L('Colombo', 'கொழும்பு', 'కొలంబో'),
      sub: L('Colombo reception', 'கொழும்பு வரவேற்பு', 'కొలంబో రిసెప్షన్'),
      meaning: L(
        'A celebration in Sri Lanka for family and friends who couldn’t make it to India, our first party as a married couple.',
        'இந்தியா வர இயலாத குடும்பத்தினருக்கும் நண்பர்களுக்கும் இலங்கையில் கொண்டாட்டம். திருமணமான பிறகு எங்கள் முதல் விருந்து.',
        'భారత్‌కు రాలేని కుటుంబ సభ్యులు, స్నేహితుల కోసం శ్రీలంకలో వేడుక. పెళ్లయ్యాక మా మొదటి విందు.',
      ),
      expect: L(
        'An elegant evening at Ramada Colombo: dinner, speeches, music and dancing.',
        'ராமடா கொழும்பில் நேர்த்தியான மாலை: விருந்து, உரைகள், இசை, நடனம்.',
        'రమాడా కొలంబోలో సొగసైన సాయంత్రం: విందు, ప్రసంగాలు, సంగీతం, నృత్యం.',
      ),
      wear: L('Evening formal or festive', 'மாலை முறையான / பண்டிகை உடை', 'సాయంత్రం ఫార్మల్ / పండుగ దుస్తులు'),
    },
  },
};

// ------------------------------------------------------------ Travel & Stay
export const travel = {
  kicker: L('Travel & Stay', 'பயணம் & தங்குமிடம்', 'ప్రయాణం & బస'),
  title: { en: ['Getting', 'there'], ta: ['எப்படி', 'வருவது'], te: ['ఎలా', 'చేరుకోవాలి'] },
  lead: L(
    'Everything you need to plan your trip to Ballari and Colombo. Please check official sites and current schedules before booking.',
    'பல்லாரி, கொழும்பு பயணத்தைத் திட்டமிட உங்களுக்குத் தேவையானவை. முன்பதிவுக்கு முன் அதிகாரப்பூர்வ தளங்களைச் சரிபார்க்கவும்.',
    'బళ్లారి, కొలంబో ప్రయాణం ప్లాన్ చేయడానికి కావలసినవన్నీ. బుక్ చేసే ముందు అధికారిక సైట్లు చూడండి.',
  ),
  labels: {
    gettingThere: L('Getting there', 'வந்தடைய', 'చేరుకోవడం'),
    visa: L('Visa', 'விசா', 'వీసా'),
    weather: L('Weather in February', 'பிப்ரவரி வானிலை', 'ఫిబ్రవరి వాతావరణం'),
    stay: L('Where to stay', 'தங்குமிடம்', 'ఎక్కడ బస చేయాలి'),
    stayNote: L('Suggestions only. Please check current reviews and rates.', 'பரிந்துரைகள் மட்டுமே. தற்போதைய மதிப்புரைகள், கட்டணங்களைச் சரிபார்க்கவும்.', 'సూచనలు మాత్రమే. ప్రస్తుత రివ్యూలు, ధరలు చూడండి.'),
    tips: L('Good to know', 'தெரிந்துகொள்ள', 'తెలుసుకోవాల్సినవి'),
    map: L('Map', 'வரைபடம்', 'మ్యాప్'),
    officialSite: L('Official site', 'அதிகாரப்பூர்வ தளம்', 'అధికారిక సైట్'),
    venue: L('Venue', 'நிகழ்விடம்', 'వేదిక'),
  },
  destinations: [
    {
      id: 'ballari',
      name: L('Ballari', 'பல்லாரி', 'బళ్లారి'),
      country: L('Karnataka, India', 'கர்நாடகா, இந்தியா', 'కర్ణాటక, భారత్'),
      events: L('Haldi · Mehendi · Reception · Wedding', 'ஹல்தி · மெஹந்தி · வரவேற்பு · திருமணம்', 'హల్దీ · మెహందీ · రిసెప్షన్ · పెళ్లి'),
      weather: { temp: '18–33 °C', text: L('Dry, sunny days and pleasant evenings. Pack light cottons and a light layer for the night.', 'வறண்ட, வெயில் நாட்கள்; இனிமையான மாலைகள். லேசான பருத்தி உடைகள் எடுத்து வரவும்.', 'పొడి, ఎండ రోజులు; ఆహ్లాదకరమైన సాయంత్రాలు. తేలికపాటి కాటన్ దుస్తులు తీసుకురండి.') },
      routes: [
        { icon: '✈️', title: L('Jindal Vijayanagar Airport (VDY)', 'ஜிண்டால் விஜயநகர் விமான நிலையம் (VDY)', 'జిందాల్ విజయనగర్ విమానాశ్రయం (VDY)'), text: L('Toranagallu, about 35–40 km from Ballari. Limited flights from Bengaluru / Hyderabad, so check current schedules.', 'தோரணகல்லு, பல்லாரியிலிருந்து சுமார் 35–40 கி.மீ. பெங்களூரு / ஹைதராபாத்திலிருந்து குறைந்த விமானங்கள்.', 'తోరణగల్లు, బళ్లారి నుండి సుమారు 35–40 కి.మీ. బెంగళూరు / హైదరాబాద్ నుండి పరిమిత విమానాలు.') },
        { icon: '🛫', title: L('Bengaluru International (BLR)', 'பெங்களூரு சர்வதேச விமான நிலையம் (BLR)', 'బెంగళూరు అంతర్జాతీయ విమానాశ్రయం (BLR)'), text: L('Best international gateway, about 300 km away (5–6 hours by road). Hubballi airport (HBX) is another option, about 150+ km away.', 'சிறந்த சர்வதேச நுழைவாயில், சுமார் 300 கி.மீ (சாலை வழியாக 5–6 மணி). ஹுப்பள்ளி (HBX) மற்றொரு வழி.', 'ఉత్తమ అంతర్జాతీయ ద్వారం, సుమారు 300 కి.మీ (రోడ్డు మార్గంలో 5–6 గంటలు). హుబ్బళ్లి (HBX) మరో మార్గం.') },
        { icon: '🚆', title: L('By train', 'ரயில் மூலம்', 'రైలులో'), text: L('Ballari Junction (BAY) has trains from Bengaluru, Hyderabad and other major cities.', 'பல்லாரி சந்திப்பு (BAY): பெங்களூரு, ஹைதராபாத் முதலிய நகரங்களிலிருந்து ரயில்கள்.', 'బళ్లారి జంక్షన్ (BAY): బెంగళూరు, హైదరాబాద్ తదితర నగరాల నుండి రైళ్లు.') },
        { icon: '🏛️', title: L('Day trip: Hampi', 'ஒரு நாள் பயணம்: ஹம்பி', 'ఒక రోజు యాత్ర: హంపి'), text: L('The UNESCO World Heritage ruins of Vijayanagara are about 60 km away. Worth adding a day!', 'யுனெஸ்கோ உலகப் பாரம்பரியச் சின்னமான விஜயநகர இடிபாடுகள் சுமார் 60 கி.மீ தொலைவில்.', 'యునెస్కో ప్రపంచ వారసత్వ ప్రదేశం విజయనగర శిథిలాలు సుమారు 60 కి.మీ దూరంలో.') },
      ],
      visa: {
        text: L('Most foreign nationals, including Sri Lankan and Australian passport holders, need an Indian visa. The e-Visa can usually be applied for online. Please check the official site for current rules.', 'இலங்கை, ஆஸ்திரேலிய கடவுச்சீட்டு உட்பட பெரும்பாலான வெளிநாட்டினருக்கு இந்திய விசா தேவை. தற்போதைய விதிகளுக்கு அதிகாரப்பூர்வ தளத்தைப் பார்க்கவும்.', 'శ్రీలంక, ఆస్ట్రేలియా పాస్‌పోర్ట్‌దారులతో సహా చాలా మంది విదేశీయులకు భారత వీసా అవసరం. ప్రస్తుత నియమాల కోసం అధికారిక సైట్ చూడండి.'),
        url: 'https://indianvisaonline.gov.in/',
      },
      hotels: [
        { name: 'Hotel Pola Paradise', area: L('Ballari city', 'பல்லாரி நகரம்', 'బళ్లారి నగరం'), mapQuery: 'Hotel Pola Paradise Ballari' },
        { name: 'iRoomz Pranathi Comforts', area: L('Bangalore Road, Ballari', 'பெங்களூரு சாலை, பல்லாரி', 'బెంగళూరు రోడ్, బళ్లారి'), mapQuery: 'iRoomz Pranathi Comforts Ballari' },
        { name: 'Hyatt Place Hampi', area: L('Hosapete, ~60 km: for a Hampi stay', 'ஹொசபேட்டை, ~60 கி.மீ', 'హొసపేటె, ~60 కి.మీ'), mapQuery: 'Hyatt Place Hampi' },
      ],
      help: L('Our families are happy to help arrange stays in Ballari. Just contact us.', 'பல்லாரியில் தங்குமிடம் ஏற்பாடு செய்ய எங்கள் குடும்பங்கள் மகிழ்ச்சியுடன் உதவும். தொடர்பு கொள்ளுங்கள்.', 'బళ్లారిలో బస ఏర్పాటు చేయడంలో మా కుటుంబాలు సంతోషంగా సహాయం చేస్తాయి. మమ్మల్ని సంప్రదించండి.'),
      tips: [
        { icon: '💵', text: L('Currency: Indian Rupee (INR). UPI and cards are widely used, but keep some cash.', 'நாணயம்: இந்திய ரூபாய் (INR). UPI, அட்டைகள் பரவலாக உள்ளன; சிறிது பணமும் வைத்திருக்கவும்.', 'కరెన్సీ: భారత రూపాయి (INR). UPI, కార్డులు విస్తృతంగా వాడతారు; కొంత నగదు ఉంచుకోండి.') },
        { icon: '🚕', text: L('Getting around: Ola / Uber availability is limited in Ballari, so book a car or auto through your hotel.', 'பல்லாரியில் Ola / Uber குறைவு. விடுதி மூலம் கார் அல்லது ஆட்டோ ஏற்பாடு செய்யவும்.', 'బళ్లారిలో Ola / Uber పరిమితం. హోటల్ ద్వారా కారు లేదా ఆటో బుక్ చేసుకోండి.') },
        { icon: '📶', text: L('SIM cards (Airtel / Jio) are available at major airports with your passport.', 'கடவுச்சீட்டுடன் முக்கிய விமான நிலையங்களில் SIM (Airtel / Jio) கிடைக்கும்.', 'పాస్‌పోర్ట్‌తో ప్రధాన విమానాశ్రయాల్లో SIM (Airtel / Jio) లభిస్తుంది.') },
        { icon: '🔌', text: L('Power: 230 V, plug types C / D / M.', 'மின்சாரம்: 230 V, பிளக் வகை C / D / M.', 'విద్యుత్: 230 V, ప్లగ్ రకాలు C / D / M.') },
      ],
    },
    {
      id: 'colombo',
      name: L('Colombo', 'கொழும்பு', 'కొలంబో'),
      country: L('Sri Lanka', 'இலங்கை', 'శ్రీలంక'),
      events: L('Reception · 20 February 2027', 'வரவேற்பு · 20 பிப்ரவரி 2027', 'రిసెప్షన్ · 20 ఫిబ్రవరి 2027'),
      weather: { temp: '23–31 °C', text: L('Warm and humid, with mostly dry days. Breathable fabrics are your friend.', 'வெப்பமும் ஈரப்பதமும்; பெரும்பாலும் வறண்ட நாட்கள். காற்றோட்டமான உடைகள் சிறந்தது.', 'వెచ్చగా, తేమగా; చాలావరకు పొడి రోజులు. గాలి ఆడే దుస్తులు మంచిది.') },
      routes: [
        { icon: '✈️', title: L('Bandaranaike International (CMB)', 'பண்டாரநாயக்க சர்வதேச விமான நிலையம் (CMB)', 'బండారనాయకే అంతర్జాతీయ విమానాశ్రయం (CMB)'), text: L('About 35 km from the city, roughly 45–60 minutes via the expressway.', 'நகரிலிருந்து சுமார் 35 கி.மீ; விரைவுச் சாலை வழியாக 45–60 நிமிடம்.', 'నగరం నుండి సుమారు 35 కి.మీ; ఎక్స్‌ప్రెస్‌వే ద్వారా 45–60 నిమిషాలు.') },
        { icon: '🏨', title: L('Ramada Colombo', 'ராமடா கொழும்பு', 'రమాడా కొలంబో'), text: L('The reception venue, at 30 Sir Mohamed Macan Markar Mawatha, Colombo 03, near Galle Face.', 'வரவேற்பு நிகழ்விடம்: 30 சர் மொஹமட் மாக்கன் மார்க்கார் மாவத்தை, கொழும்பு 03.', 'రిసెప్షన్ వేదిక: 30 సర్ మొహమ్మద్ మాకన్ మార్కర్ మావత, కొలంబో 03.') },
      ],
      visa: {
        text: L('Most visitors need an Electronic Travel Authorization (ETA) for Sri Lanka. Rules change from time to time, so please check the official site.', 'இலங்கைக்குப் பெரும்பாலான பயணிகளுக்கு ETA தேவை. விதிகள் மாறலாம், அதிகாரப்பூர்வ தளத்தைப் பார்க்கவும்.', 'శ్రీలంకకు చాలా మంది ప్రయాణికులకు ETA అవసరం. నియమాలు మారవచ్చు, అధికారిక సైట్ చూడండి.'),
        url: 'https://www.eta.gov.lk/',
      },
      hotels: [
        { name: 'Ramada Colombo', area: L('The venue · Colombo 03', 'நிகழ்விடம் · கொழும்பு 03', 'వేదిక · కొలంబో 03'), mapQuery: 'Ramada by Wyndham Colombo', venue: true },
        { name: 'Cinnamon Lakeside', area: L('Beira Lake · Colombo 02', 'பேரே ஏரி · கொழும்பு 02', 'బేరా సరస్సు · కొలంబో 02'), mapQuery: 'Cinnamon Lakeside Colombo' },
        { name: 'Taj Samudra', area: L('Galle Face · Colombo 03', 'காலி முகம் · கொழும்பு 03', 'గాలె ఫేస్ · కొలంబో 03'), mapQuery: 'Taj Samudra Colombo' },
        { name: 'Galle Face Hotel', area: L('Seafront · Colombo 03', 'கடற்கரை · கொழும்பு 03', 'సముద్రతీరం · కొలంబో 03'), mapQuery: 'Galle Face Hotel Colombo' },
      ],
      tips: [
        { icon: '💵', text: L('Currency: Sri Lankan Rupee (LKR). Cards are accepted in hotels and malls.', 'நாணயம்: இலங்கை ரூபாய் (LKR). விடுதிகளிலும் கடைகளிலும் அட்டைகள் ஏற்கப்படும்.', 'కరెన్సీ: శ్రీలంక రూపాయి (LKR). హోటళ్లు, మాల్స్‌లో కార్డులు అంగీకరిస్తారు.') },
        { icon: '🚕', text: L('Getting around: PickMe and Uber both work well in Colombo.', 'PickMe, Uber இரண்டும் கொழும்பில் நன்றாக இயங்குகின்றன.', 'PickMe, Uber రెండూ కొలంబోలో బాగా పనిచేస్తాయి.') },
        { icon: '📶', text: L('Tourist SIMs (Dialog / Mobitel) are sold at the airport arrivals hall.', 'விமான நிலைய வருகை மண்டபத்தில் சுற்றுலா SIM (Dialog / Mobitel) கிடைக்கும்.', 'విమానాశ్రయ అరైవల్స్‌లో టూరిస్ట్ SIM (Dialog / Mobitel) లభిస్తుంది.') },
        { icon: '🔌', text: L('Power: 230 V, plug types D / G / M.', 'மின்சாரம்: 230 V, பிளக் வகை D / G / M.', 'విద్యుత్: 230 V, ప్లగ్ రకాలు D / G / M.') },
      ],
    },
  ],
};

// ------------------------------------------------------------ FAQ
// `{rsvpBy}` is replaced with the formatted RSVP date from wedding.js.
export const faq = {
  kicker: L('Questions', 'கேள்விகள்', 'ప్రశ్నలు'),
  title: { en: ['Good to', 'know'], ta: ['தெரிந்து', 'கொள்ளுங்கள்'], te: ['తెలుసుకోవలసిన', 'విషయాలు'] },
  lead: L('Can’t find your answer? Message us. We’re always happy to help.', 'பதில் கிடைக்கவில்லையா? எங்களுக்குச் செய்தி அனுப்புங்கள்.', 'సమాధానం దొరకలేదా? మాకు సందేశం పంపండి.'),
  contactCta: L('Contact us', 'தொடர்பு கொள்ள', 'సంప్రదించండి'),
  items: [
    { q: L('When should I RSVP by?', 'எப்போதுக்குள் பதிலளிக்க வேண்டும்?', 'ఎప్పటిలోగా RSVP చేయాలి?'), a: L('Please reply by {rsvpBy} using the RSVP form on this page. It helps us plan seating and catering.', 'இந்தப் பக்கத்தில் உள்ள படிவத்தின் மூலம் {rsvpBy}க்குள் பதிலளிக்கவும்.', 'దయచేసి {rsvpBy} లోగా ఈ పేజీలోని ఫారమ్ ద్వారా స్పందించండి.') },
    { q: L('Which events am I invited to?', 'நான் எந்த நிகழ்வுகளுக்கு அழைக்கப்பட்டுள்ளேன்?', 'నన్ను ఏ వేడుకలకు ఆహ్వానించారు?'), a: L('Your personal invitation link shows exactly the events we’ve reserved for you, and the RSVP form lists only those.', 'உங்கள் தனிப்பட்ட இணைப்பு உங்களுக்கான நிகழ்வுகளை மட்டுமே காட்டும்.', 'మీ వ్యక్తిగత లింక్ మీ కోసం ఉన్న వేడుకలను మాత్రమే చూపిస్తుంది.') },
    { q: L('Can I bring children or a plus-one?', 'குழந்தைகள் அல்லது கூடுதல் நபரை அழைத்து வரலாமா?', 'పిల్లలు లేదా అదనపు వ్యక్తిని తీసుకురావచ్చా?'), a: L('Your invite shows how many seats we’ve reserved for your family, including children. If you need a change, please message us.', 'உங்கள் குடும்பத்திற்கு (குழந்தைகள் உட்பட) எத்தனை இருக்கைகள் ஒதுக்கப்பட்டுள்ளன என்பதை அழைப்பு காட்டும்.', 'మీ కుటుంబానికి (పిల్లలతో సహా) ఎన్ని సీట్లు కేటాయించామో ఆహ్వానం చూపిస్తుంది.') },
    { q: L('Do you have a gift registry?', 'பரிசுப் பட்டியல் உள்ளதா?', 'బహుమతుల జాబితా ఉందా?'), a: L('There’s no registry. Gifts are welcome but never expected: your presence is the best gift.', 'பதிவேடு இல்லை. பரிசுகள் வரவேற்கப்படும், ஆனால் எதிர்பார்க்கப்படுவதில்லை. உங்கள் வருகையே சிறந்த பரிசு.', 'జాబితా లేదు. బహుమతులు స్వాగతం, కానీ తప్పనిసరి కాదు. మీ రాకే ఉత్తమ బహుమతి.') },
    { q: L('What should I wear?', 'என்ன உடை அணிய வேண்டும்?', 'ఏం ధరించాలి?'), a: L('Each event card shows its dress code: yellow for Haldi, green for Mehendi, traditional attire for the wedding. See the Ceremonies guide for ideas.', 'ஒவ்வொரு நிகழ்வு அட்டையிலும் உடைக் குறிப்பு உள்ளது: ஹல்திக்கு மஞ்சள், மெஹந்திக்கு பச்சை, திருமணத்திற்குப் பாரம்பரிய உடை.', 'ప్రతి వేడుక కార్డులో దుస్తుల సూచన ఉంది: హల్దీకి పసుపు, మెహందీకి ఆకుపచ్చ, పెళ్లికి సాంప్రదాయ దుస్తులు.') },
    { q: L('Can I take photos?', 'புகைப்படம் எடுக்கலாமா?', 'ఫోటోలు తీయవచ్చా?'), a: L('Absolutely, and please share them in our guest album! During the sacred moments of the wedding, we kindly ask you to keep phones down and let our photographers capture it.', 'நிச்சயமாக! எங்கள் ஆல்பத்தில் பகிருங்கள். திருமணத்தின் புனித தருணங்களில் மட்டும் கைபேசிகளைத் தவிர்க்க வேண்டுகிறோம்.', 'తప్పకుండా! మా ఆల్బమ్‌లో పంచుకోండి. పెళ్లిలోని పవిత్ర ఘట్టాల సమయంలో మాత్రం ఫోన్లు పక్కన పెట్టమని కోరుతున్నాం.') },
    { q: L('What food will be served?', 'என்ன உணவு வழங்கப்படும்?', 'ఏ ఆహారం వడ్డిస్తారు?'), a: L('There will be vegetarian and non-vegetarian options. Please tell us about any allergies or dietary needs in your RSVP.', 'சைவம், அசைவம் இரண்டும் இருக்கும். ஒவ்வாமைகளை RSVP-இல் தெரிவிக்கவும்.', 'శాకాహార, మాంసాహార ఎంపికలు ఉంటాయి. అలర్జీలను RSVP లో తెలపండి.') },
    { q: L('Is there parking or transport?', 'வாகன நிறுத்தம் / போக்குவரத்து உள்ளதா?', 'పార్కింగ్ / రవాణా ఉందా?'), a: L('Parking is available at the venues. If you need help with transport from your hotel, let us know and our families will help coordinate.', 'நிகழ்விடங்களில் வாகன நிறுத்தம் உள்ளது. விடுதியிலிருந்து போக்குவரத்து தேவைப்பட்டால் தெரிவிக்கவும்.', 'వేదికల వద్ద పార్కింగ్ ఉంది. హోటల్ నుండి రవాణా కావాలంటే మాకు తెలియజేయండి.') },
    { q: L('What language are the ceremonies in?', 'சடங்குகள் எந்த மொழியில்?', 'వేడుకలు ఏ భాషలో?'), a: L('The rituals are performed in Sanskrit with Telugu and Tamil traditions. Our families will happily explain what’s happening, and so will the Ceremonies guide above.', 'சடங்குகள் சம்ஸ்கிருதத்தில், தெலுங்கு-தமிழ் மரபுகளுடன் நடைபெறும். எங்கள் குடும்பத்தினர் மகிழ்ச்சியுடன் விளக்குவர்.', 'ఆచారాలు సంస్కృతంలో, తెలుగు-తమిళ సంప్రదాయాలతో జరుగుతాయి. మా కుటుంబ సభ్యులు సంతోషంగా వివరిస్తారు.') },
    { q: L('Can I change my RSVP?', 'என் பதிலை மாற்றலாமா?', 'నా RSVP మార్చవచ్చా?'), a: L('Yes. Open the same personal link any time before the deadline and update your reply.', 'ஆம். காலக்கெடுவுக்கு முன் அதே இணைப்பைத் திறந்து மாற்றலாம்.', 'అవును. గడువులోగా అదే లింక్ తెరిచి మార్చుకోవచ్చు.') },
  ],
};
