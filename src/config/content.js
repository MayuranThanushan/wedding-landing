// =====================================================================
// Editable copy for the Couple, Ceremonies and FAQ sections.
// Every text is { en, ta, te }; a missing language falls back to English.
// Tamil / Telugu text is machine-drafted — please have a native speaker review.
// =====================================================================

// ------------------------------------------------------------ The couple (short intro)
export const couple = {
  kicker: { en: 'The Couple', ta: 'மணமக்கள்', te: 'వధూవరులు' },
  quote: {
    en: 'Two hearts, two families, one beautiful beginning.',
    ta: 'இரு இதயங்கள், இரு குடும்பங்கள், ஒரு அழகிய தொடக்கம்.',
    te: 'రెండు హృదయాలు, రెండు కుటుంబాలు, ఒక అందమైన ఆరంభం.',
  },
  line: {
    en: 'With the blessings of our elders, we begin our forever together — and we would love you to be part of it.',
    ta: 'பெரியோர்களின் ஆசீர்வாதத்துடன் எங்கள் வாழ்க்கைப் பயணத்தைத் தொடங்குகிறோம் — நீங்களும் அதில் பங்கேற்க விரும்புகிறோம்.',
    te: 'పెద్దల ఆశీస్సులతో మా జీవిత ప్రయాణాన్ని ప్రారంభిస్తున్నాము — మీరు కూడా అందులో భాగం కావాలని కోరుకుంటున్నాము.',
  },
  groom: { name: 'Rohit', role: { en: 'The Groom', ta: 'மணமகன்', te: 'వరుడు' }, family: { en: 'Son of Mr. Sreenivas Reddy & Mrs. Varala Reddy', ta: 'திரு. ஸ்ரீனிவாஸ் ரெட்டி & திருமதி. வரலா ரெட்டி அவர்களின் மகன்', te: 'శ్రీ శ్రీనివాస్ రెడ్డి & శ్రీమతి వరల రెడ్డి గార్ల కుమారుడు' } },
  bride: { name: 'Gayathiri', role: { en: 'The Bride', ta: 'மணமகள்', te: 'వధువు' }, family: { en: 'Daughter of Mr. Alagaratnam Mayuran & Mrs. Jayanthi Mayuran', ta: 'திரு. அழகரத்தினம் மயூரன் & திருமதி. ஜெயந்தி மயூரன் அவர்களின் மகள்', te: 'శ్రీ అళగరత్నం మయూరన్ & శ్రీమతి జయంతి మయూరన్ గార్ల కుమార్తె' } },
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

// ------------------------------------------------------------ FAQ
// `{rsvpBy}` is replaced with the formatted RSVP date from wedding.js.
export const faq = {
  kicker: L('Questions', 'கேள்விகள்', 'ప్రశ్నలు'),
  title: { en: ['Good to', 'know'], ta: ['தெரிந்து', 'கொள்ளுங்கள்'], te: ['తెలుసుకోవలసిన', 'విషయాలు'] },
  lead: L('Can’t find your answer? Message us. We’re always happy to help.', 'பதில் கிடைக்கவில்லையா? எங்களுக்குச் செய்தி அனுப்புங்கள்.', 'సమాధానం దొరకలేదా? మాకు సందేశం పంపండి.'),
  contactCta: L('Contact us', 'தொடர்பு கொள்ள', 'సంప్రదించండి'),
  items: [
    { q: L('Which event needs an RSVP?', 'எந்த நிகழ்வுக்கு பதில் தேவை?', 'ఏ వేడుకకు RSVP అవసరం?'), a: L('Only the Colombo reception. Please reply by {rsvpBy} using the RSVP form on your personal link.', 'கொழும்பு வரவேற்புக்கு மட்டும். உங்கள் தனிப்பட்ட இணைப்பில் உள்ள படிவம் மூலம் {rsvpBy}க்குள் பதிலளிக்கவும்.', 'కొలంబో రిసెప్షన్‌కు మాత్రమే. మీ వ్యక్తిగత లింక్‌లోని ఫారం ద్వారా {rsvpBy} లోగా స్పందించండి.') },
    { q: L('What about the ceremonies in Ballari?', 'பல்லாரி சடங்குகள் பற்றி?', 'బళ్లారి వేడుకల సంగతి?'), a: L('The Haldi, Mehendi, wedding and Ballari reception are intimate celebrations with close family. If you are invited, they appear on your personal link and no RSVP is needed. We will be in touch personally.', 'மஞ்சள் நீராட்டு, மெஹந்தி, திருமணம் மற்றும் பல்லாரி வரவேற்பு நெருங்கிய உறவினர்களுடன் நடைபெறும். நீங்கள் அழைக்கப்பட்டிருந்தால் அவை உங்கள் இணைப்பில் தெரியும்; பதில் தேவையில்லை.', 'పసుపు, మెహందీ, వివాహం మరియు బళ్లారి రిసెప్షన్ దగ్గరి బంధువులతో జరిగే వేడుకలు. మీరు ఆహ్వానించబడితే అవి మీ లింక్‌లో కనిపిస్తాయి; RSVP అవసరం లేదు.') },
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
