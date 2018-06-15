import {getParent, getParentOfType, hasParentOfType, onAction, onSnapshot, types, detach, getPath, getSnapshot, unprotect} from 'mobx-state-tree';
import {computed, decorate, extendObservable, observable, reaction} from 'mobx';

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
      },
      get numCopy() {
        return self.num;
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
      },
      collectSum() {
        return self.children.reduce((s, i) => {
          return s + i.num
        }, 0)
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
  console.time('create one parent');
  const parent = Parent.create(ParentSnapshotBase);
  console.timeEnd('create one parent');
  console.log('Parent:', parent);
  return parent;
}

function CreateParents(count = 10) {
  console.time(`create ${count} parents`);
  const parents = Array(count);
  for (let i = 0; i < count; i++) {
    parents[i] = Parent.create(ParentSnapshotBase);
  }
  console.timeEnd(`create ${count} parents`);
  console.log('Parents:', parents);
  return parents;
}

/*const test = CreateOneParent();

onAction(test, a => console.log('onAction', a));
onSnapshot(test, s => console.log('onSnapshot', s));

test.setNum1(-1);
test.children[0].setNum(-2);
test.children[1].children[0].setNum(-3);*/


const ChildInMap = types.model('ChildInMap', {
  id: types.identifier(types.string),
  name: types.string,
  surname: types.string,
});

const ParentWithMap = types
  .model('ParentWithMap', {
    items: types.map(ChildInMap)
  })
  .actions(self => ({
    changeItem(payload: any) {
      self.items.put(payload);
    }
  }));


const ArrayItem = types.model('ArrayItem', {
  id: types.identifier(),
  text: types.string
})

const TwoArraysParent = types.model({
  firstArray: types.array(ArrayItem),
  secondArray: types.array(ArrayItem)
})

const example = TwoArraysParent.create({
  firstArray: [{id: '1', text: 'one'}, {id: '2', text: 'two'}],
  secondArray: [{id: '3', text: 'three'}, {id: '4', text: 'four'}]
})

unprotect(example);

reaction(
  () => example.firstArray.map(i => i),
  arr1 => console.log('firstArray', arr1.map(i => getPath(i))),
  {fireImmediately: true}
)
reaction(
  () => example.secondArray.map(i => i),
  arr2 => console.log('secondArray', arr2.map(i => getPath(i))),
  {fireImmediately: true}
)
console.log('-----------');
const two = detach(example.firstArray[1])
example.secondArray.unshift(two)


/*class MobxChild {
  @observable a: string;
  @observable b: string;
  @observable n: number;
  @observable m: number;

  constructor(a: string, b: string, n: number, m: number) {
    this.a = a;
    this.b = b;
    this.n = n;
    this.m = m;
  }

  @computed
  get ab() {
    return `${this.a}_${this.b}`
  }

  @computed
  get nm() {
    return this.n + this.m
  }
}

class MobxParent {
  @observable x: Array<MobxChild>
  constructor(x: Array<MobxChild>) {
    this.x = x;
  }
}

let count = 0;
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
const lettersCount = letters.length;

function CrateMobxChildren(size = 10) {
  const result = Array(size)
  for(let i = 0; i < size; i++) {
    const a = letters[count % lettersCount];
    const b = a.toUpperCase();
    result[i] = new MobxChild(a, b, ++count, count + 1)
  }
  return result;
}

function CrateMobxParents(size = 100) {
  const result = Array(size)
  for(let i = 0; i < size; i++) {
    const x = CrateMobxChildren();
    result[i] = new MobxParent(x)
  }
  return result;
}*/

export {CreateOneParent, CreateParents};







/*const Child = types
  .model('Child', {})
  .actions(self => ({
    getA() {
      return hasParentOfType(self, ParentA)
    },
    getB() {
      return hasParentOfType(self, ParentB)
    }
  }));

const ParentA = types.model('ParentA', {
  child: Child
});
const ParentB = ParentA.named('ParentB');

const parentA = ParentA.create({child: {}})
console.log(parentA.child.getA()); //true
console.log(parentA.child.getB()); //false
const parentB = ParentB.create({child: {}})
console.log(parentB.child.getA()); //false
console.log(parentB.child.getB()); //true*/


