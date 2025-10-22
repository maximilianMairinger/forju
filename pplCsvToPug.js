const data = `Anja Hofer	Stv. Leitung Aus- & Weiterbildung	Vereinsvorstand
Anna Fabrizy	Stv. Leitung Öffentlichkeitsarbeit	Vereinsvorstand
Asya Efe	Leitung Science Redaktion	Vereinsvorstand
Batuhan Alisoglu	Leitung Internationales	Vereinsvorstand
Benedikt Wolf	BJV Delegate	Vereinsvorstand
Julian Kadlicz	Presse & HR	Vereinsvorstand
Laura Scholz	Geschäftsführerin	Vereinsvorstand
Lino Stockinger	Leitung Kooperationen	Vereinsvorstand
Marc-Luis Tacho	Stv. Leitung Kooperation	Vereinsvorstand
Marco Vorgic	Leitung Aus- & Weiterbildung	Vereinsvorstand
Sarah Ceculovic	Leitung Öffentlichkeitsarbeit	Vereinsvorstand
Sophie Heinrich	Generalsekretärin	Vereinsvorstand
Una Saric	Stv. Leitung Science Redaktion	Vereinsvorstand
Adrian Swoboda	IT-Administrator	Vereinsleitung
Alena Petric	Mitglied Öffentlichkeitsarbeit	Vereinsleitung`;

function generatePug(data) {
  const lines = data.trim().split('\n');
  
  const contacts = lines
    .map(line => {
      const [personName, position, role] = line.split('\t');
      return { personName: personName.trim(), position: position.trim(), role: role.trim() };
    })
    .filter(person => person.role === 'Vereinsvorstand')
    .map(person => {
      const pic = person.personName.toLowerCase().replace(/\s+/g, '_').replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss');
      const emailName = person.personName.toLowerCase().replace(/\s+/g, '.').replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss');
      const email = `${emailName}@forju.at`;
      
      return `c-contact-card(personName="${person.personName}" position="${person.position}" pic="${pic}" email="${email}")`;
    });
    
  console.log(contacts.join('\n'));
}

generatePug(data);