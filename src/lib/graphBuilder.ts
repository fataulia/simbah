import { Node, Edge } from 'reactflow';

interface Person {
  id: string;
  name: string;
  gender: string;
  birthDate?: string | null;
  photoUrl?: string | null;
  generation: number;
  isDeceased: boolean;
}

interface Family {
  id: string;
  partner1Id: string;
  partner2Id: string | null;
}

interface Child {
  id: string;
  familyId: string;
  childId: string;
  relationshipType: string;
}

export function buildGraph(people: Person[], families: Family[], children: Child[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const processedPersonIds = new Set<string>();
  const processedFamilyIds = new Set<string>();

  // Group by generation
  const peopleByGen: Record<number, Person[]> = {};
  people.forEach(p => {
    if (!peopleByGen[p.generation]) peopleByGen[p.generation] = [];
    peopleByGen[p.generation].push(p);
  });

  const generations = Object.keys(peopleByGen).map(Number).sort((a, b) => a - b);

  // We will process generation by generation, but inside each generation, 
  // we group siblings together based on their parent family.
  
  generations.forEach(gen => {
    const currentGenPeople = peopleByGen[gen];
    
    // To keep it stable, we first identify those who haven't been processed yet
    // (Likely because they are "root" ancestors or were missed in the family walk)
    
    // We want to sort the "entry points" of this generation by age
    const entries = currentGenPeople
        .filter(p => !processedPersonIds.has(p.id))
        .sort((a, b) => {
            const yearA = a.birthDate ? new Date(a.birthDate).getFullYear() : 9999;
            const yearB = b.birthDate ? new Date(b.birthDate).getFullYear() : 9999;
            return yearA - yearB;
        });

    entries.forEach(person => {
        addPersonAndSpouse(person.id);
    });
  });

  function addPersonAndSpouse(personId: string) {
    if (processedPersonIds.has(personId)) return;
    
    const person = people.find(p => p.id === personId);
    if (!person) return;

    // 1. Add the person
    nodes.push({
      id: `person_${person.id}`,
      type: 'person',
      data: { ...person },
      position: { x: 0, y: 0 },
    });
    processedPersonIds.add(person.id);

    // 2. Find all families this person is involved in
    const personFamilies = families.filter(f => f.partner1Id === person.id || f.partner2Id === person.id);
    
    personFamilies.forEach(family => {
      if (processedFamilyIds.has(family.id)) return;

      // 3. Add Family Node
      nodes.push({
        id: `family_${family.id}`,
        type: 'family',
        data: { ...family },
        position: { x: 0, y: 0 },
      });
      processedFamilyIds.add(family.id);

      // 4. Add Spouse if exists and not processed
      const spouseId = family.partner1Id === person.id ? family.partner2Id : family.partner1Id;
      if (spouseId) {
        const spouse = people.find(p => p.id === spouseId);
        if (spouse && !processedPersonIds.has(spouse.id)) {
          nodes.push({
            id: `person_${spouse.id}`,
            type: 'person',
            data: { ...spouse },
            position: { x: 0, y: 0 },
          });
          processedPersonIds.add(spouse.id);
        }
      }

      // 5. Marriage Edges
      if (family.partner1Id) {
        edges.push({
          id: `e-p1-${family.partner1Id}-${family.id}`,
          source: `person_${family.partner1Id}`,
          target: `family_${family.id}`,
          type: 'step',
          zIndex: 10,
        });
      }
      if (family.partner2Id) {
        edges.push({
          id: `e-p2-${family.partner2Id}-${family.id}`,
          source: `person_${family.partner2Id}`,
          target: `family_${family.id}`,
          type: 'step',
          zIndex: 10,
        });
      }

      // 6. PRE-ORDER CHILDREN: This is the critical part for the user's request.
      // We find all children of THIS family and sort them by birth date.
      const familyChildrenRels = children.filter(c => c.familyId === family.id);
      const familyChildren = familyChildrenRels
        .map(rel => people.find(p => p.id === rel.childId))
        .filter((p): p is Person => !!p)
        .sort((a, b) => {
            const yearA = a.birthDate ? new Date(a.birthDate).getFullYear() : 9999;
            const yearB = b.birthDate ? new Date(b.birthDate).getFullYear() : 9999;
            return yearA - yearB;
        });

      // We add edges in the sorted order. This helps ELK maintain the left-to-right age order.
      familyChildren.forEach(child => {
        edges.push({
          id: `e-child-${family.id}-${child.id}`,
          source: `family_${family.id}`,
          target: `person_${child.id}`,
          type: 'smoothstep',
          animated: true,
        });
      });
    });
  }

  return { nodes, edges };
}
