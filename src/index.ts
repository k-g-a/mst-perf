import {getParent, onAction, onSnapshot, types} from 'mobx-state-tree';


function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const GrandChild = types
  .model('GrandChild', {
    type: types.optional(types.enumeration(['X', 'Y', 'Z']), () => {
      const rnd = Math.random();
      if (rnd < 0.33) {
        return 'X';
      } else if (rnd < 0.66) {
        return 'Y';
      } else {
        return 'Z';
      }
    }),
    num: types.optional(types.number, 0)
  })
  .extend(self => {
    const views = {
      get parent() {
        return getParent(self, 2);
      },
      get combo() {
        const parent = views.parent;
        const parentType = parent.type;
        const grandParent = parent.parent;
        const grandParentName = grandParent.name;

        return `${grandParentName}+${parentType}+${self.type}`;
      }
    };

    const actions = {
      setNum(value: number) {
        self.num = value;
      }
    };

    return {views, actions};
  });

const Child = types
  .model('Child', {
    type: types.optional(types.enumeration(['A', 'B', 'C']), () => {
      const rnd = Math.random();
      if (rnd < 0.33) {
        return 'A';
      } else if (rnd < 0.66) {
        return 'B';
      } else {
        return 'C';
      }
    }),
    num: types.optional(types.number, () => getRandomArbitrary(1, 100)),
    children: types.array(GrandChild)
  })
  .extend(self => {
    const views = {
      get parent() {
        return getParent(self, 2);
      }
    };

    const actions = {
      setNum(value: number) {
        self.num = value;
      }
    };

    return {views, actions};
  });

const Parent = types
  .model('Parent', {
    first: types.string,
    last: types.string,
    num1: types.number,
    num2: types.number,
    children: types.array(Child)
  })
  .extend(self => {
    const views = {
      get name() {
        return `${self.first} + ${self.last}`;
      },
      get sum() {
        return self.num1 + self.num2;
      }
    };

    const actions = {
      setNum1(value: number) {
        self.num1 = value;
      },
      setNum2(value: number) {
        self.num2 = value;
      }
    };

    return {views, actions};
  });

const ParentSnapshotBase = {
  first: 'Foo',
  last: 'Bar',
  num1: 1,
  num2: 2,
  children: Array(100).fill({
    children: Array(10).fill({})
  })
};

// console.log('ParentSnapshotBase', ParentSnapshotBase);

function CreateOneParent() {
  console.time('create');
  const parent = Parent.create(ParentSnapshotBase);
  console.timeEnd('create');
  console.log('Parent:', parent);
  return parent;
}


const test = CreateOneParent();

onAction(test, (a) => console.log('onAction', a));
onSnapshot(test, (s) => console.log('onSnapshot', s));


test.setNum1(-1);
test.children[0].setNum(-2);
test.children[1].children[0].setNum(-3);


export {
  CreateOneParent
}

