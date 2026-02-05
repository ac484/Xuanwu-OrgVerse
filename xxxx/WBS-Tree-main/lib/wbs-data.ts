import type { Task } from '@/lib/types';

export const initialTasks: Task[] = [
  {
    id: 'proj-1',
    no: '1',
    name: 'New Home Construction',
    description: 'Complete project for building a new residential house.',
    type: 'Project',
    priority: 'High',
    owner: 'Project Manager',
    assignees: ['Project Manager', 'Construction Lead'],
    tags: ['construction', 'residential'],
    
    quantity: 1,
    unit: 'Project',
    unitPrice: 300000,
    currency: 'USD',
    taxRate: 0,
    
    startTime: new Date('2024-08-01').toISOString(),
    endTime: new Date('2025-07-31').toISOString(),
    actualStartTime: null,
    actualEndTime: null,

    progress: 10,
    weight: 100,
    status: 'In Progress',

    location: '123 Greenfield Ave',
    space: 'Main Lot',
    attachments: [],

    dependencies: [],
    locked: false,
    
    completedBy: null,
    completedAt: null,

    children: [
      {
        id: 'proj-1.1',
        no: '1.1',
        name: 'Foundation',
        description: 'Lay the foundation for the house.',
        type: 'Phase',
        priority: 'High',
        owner: 'Construction Lead',
        assignees: ['Construction Lead', 'Heavy Machinery Op.', 'Concrete Crew'],
        tags: ['foundation'],

        quantity: 1,
        unit: 'Phase',
        unitPrice: 50000,
        currency: 'USD',
        taxRate: 0,

        startTime: new Date('2024-08-01').toISOString(),
        endTime: new Date('2024-09-30').toISOString(),
        actualStartTime: null,
        actualEndTime: null,

        progress: 0,
        weight: 20,
        status: 'To Do',
        
        location: '123 Greenfield Ave',
        space: 'Main Lot',
        attachments: [],

        dependencies: [],
        locked: false,

        completedBy: null,
        completedAt: null,
        
        children: [
            {
                id: 'proj-1.1.1',
                no: '1.1.1',
                name: 'Excavation',
                description: 'Excavate the site for the foundation.',
                type: 'Task',
                priority: 'High',
                owner: 'Heavy Machinery Op.',
                assignees: ['Heavy Machinery Op.'],
                tags: ['excavation', 'earthwork'],

                quantity: 100,
                unit: 'cubic meter',
                unitPrice: 150,
                currency: 'USD',
                taxRate: 8.5,

                startTime: new Date('2024-08-01').toISOString(),
                endTime: new Date('2024-08-15').toISOString(),
                actualStartTime: null,
                actualEndTime: null,

                progress: 0,
                weight: 40,
                status: 'To Do',

                location: '123 Greenfield Ave',
                space: 'Main Lot',
                attachments: [],

                dependencies: [],
                locked: false,
                
                completedBy: null,
                completedAt: null,
                children: [],
              },
              {
                id: 'proj-1.1.2',
                no: '1.1.2',
                name: 'Pour Concrete',
                description: 'Pour concrete for foundation walls and slab.',
                type: 'Task',
                priority: 'High',
                owner: 'Concrete Crew',
                assignees: ['Concrete Crew'],
                tags: ['concrete'],

                quantity: 1,
                unit: 'job',
                unitPrice: 25000,
                currency: 'USD',
                taxRate: 8.5,

                startTime: new Date('2024-08-16').toISOString(),
                endTime: new Date('2024-08-30').toISOString(),
                actualStartTime: null,
                actualEndTime: null,
                
                progress: 0,
                weight: 60,
                status: 'To Do',
                
                location: '123 Greenfield Ave',
                space: 'Main Lot',
                attachments: [],
                
                dependencies: ['proj-1.1.1'],
                locked: false,
                
                completedBy: null,
                completedAt: null,
                children: [],
              },
        ],
      },
      {
        id: 'proj-1.2',
        no: '1.2',
        name: 'Framing & Exterior',
        description: 'Build the structure and exterior walls.',
        type: 'Phase',
        priority: 'High',
        owner: 'Framing Lead',
        assignees: ['Framing Lead'],
        tags: ['framing', 'exterior'],

        quantity: 1,
        unit: 'Phase',
        unitPrice: 100000,
        currency: 'USD',
        taxRate: 0,
        
        startTime: new Date('2024-10-01').toISOString(),
        endTime: new Date('2024-12-31').toISOString(),
        actualStartTime: null,
        actualEndTime: null,
        
        progress: 0,
        weight: 40,
        status: 'To Do',
        
        location: '123 Greenfield Ave',
        space: 'Building Shell',
        attachments: [],

        dependencies: ['proj-1.1'],
        locked: false,
        
        completedBy: null,
        completedAt: null,
        children: [],
      },
    ],
  },
];
