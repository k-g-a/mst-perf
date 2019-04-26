import {getParent, Instance, onAction, onSnapshot, types} from 'mobx-state-tree';
import {action, computed, extendObservable, observable} from 'mobx';

function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const getGrandChildType = () => {
  const rnd = Math.random();
  if (rnd < 0.33) {
    return 'X';
  } else if (rnd < 0.66) {
    return 'Y';
  } else {
    return 'Z';
  }
};

const getChildType = () => {
  const rnd = Math.random();
  if (rnd < 0.33) {
    return 'A';
  } else if (rnd < 0.66) {
    return 'B';
  } else {
    return 'C';
  }
};

//BEGIN PURE MOBX

class MobxGrandChild {
  @observable public type: string;
  @observable public num: number;
  @observable private readonly _parent: MobxChild;
  constructor(parent: MobxChild) {
    this.type = getGrandChildType();
    this.num = getRandomArbitrary(0, 10);
    this._parent = parent;
  }

  @computed
  get parent() {
    return this._parent;
  }

  @computed
  get combo() {
    const parent = this.parent;
    const parentType = parent.type;
    const grandParent = parent.parent;
    const grandParentName = grandParent.name;

    return `${grandParentName} -> ${parentType} -> ${this.type}`;
  }

  @action
  setNum(num: number) {
    this.num = num;
  }
}

class MobxChild {
  @observable public type: string;
  @observable public num: number;
  @observable public children: MobxGrandChild[];
  @observable private readonly _parent: MobxParent;
  constructor(parent: MobxParent, children: object[]) {
    this.type = getChildType();
    this.num = getRandomArbitrary(0, 100);
    this.children = children.map(() => {
      return new MobxGrandChild(this);
    });
    this._parent = parent;
  }

  @computed
  get parent() {
    return this._parent;
  }

  @computed
  get numCopy() {
    return this.num;
  }

  @action
  setNum(num: number) {
    this.num = num;
  }

  @action
  collectSum() {
    return this.children.reduce((s, i) => {
      return s + i.num;
    }, 0);
  }
}
interface IParentValues {
  first: string;
  last: string;
  num1: number;
  num2: number;
  children: {children?: object[]}[];
}
class MobxParent {
  @observable public first: string;
  @observable public last: string;
  @observable public num1: number;
  @observable public num2: number;
  @observable public children: MobxChild[];
  constructor(values: IParentValues) {
    this.first = values.first;
    this.last = values.last;
    this.num1 = values.num1;
    this.num2 = values.num2;
    this.children = values.children.map(s => {
      return new MobxChild(this, s.children);
    });
  }

  @computed
  get name() {
    return `${this.first} ${this.last}`;
  }

  @computed
  get sum() {
    return this.num1 + this.num2;
  }

  @action
  setNum1(value: number) {
    this.num1 = value;
  }

  @action
  setNum2(value: number) {
    this.num2 = value;
  }

  @action
  collectSum() {
    return this.children.reduce((s, i) => {
      return s + i.num;
    }, 0);
  }

  @action
  collectDeepSum() {
    return this.children.reduce((s, i) => {
      return s + i.collectSum();
    }, 0);
  }
}

function CreateOneMobxParent() {
  console.time('create one parent');
  const parent = new MobxParent(ParentSnapshotBase);
  console.timeEnd('create one parent');
  console.log('Parent:', parent);
  return parent;
}

function CreateMobxParents(count = 10) {
  console.time(`create ${count} parents`);
  const parents = Array(count);
  for (let i = 0; i < count; i++) {
    parents[i] = new MobxParent(ParentSnapshotBase);
  }
  console.timeEnd(`create ${count} parents`);
  console.log('Parents:', parents);
  return parents;
}

//END PURE MOBX

// BEGIN: SIMPLE
/*const GrandChild = types
  .model('GrandChild', {
    type: types.optional(types.enumeration(['X', 'Y', 'Z']), getGrandChildType),
    num: types.optional(types.number, () => getRandomArbitrary(0, 10))
  })
  .views(self => ({
    get parent(): Instance<typeof Child> {
      return getParent(self, 2);
    },
    get combo() {
      const parent = this.parent;
      const parentType = parent.type;
      const grandParent = parent.parent;
      const grandParentName = grandParent.name;

      return `${grandParentName} -> ${parentType} -> ${self.type}`;
    }
  }))
  .actions((self) => ({
    setNum( value: number) {
      self.num = value;
    }
  }));

const Child = types
  .model('Child', {
    type: types.optional(types.enumeration(['A', 'B', 'C']), getChildType),
    num: types.optional(types.number, () => getRandomArbitrary(1, 100)),
    children: types.array(GrandChild)
  })
  .views(self => ({
    get parent(): Instance<typeof Parent> {
      return getParent(self, 2);
    },
    get numCopy() {
      return self.num;
    }
  }))
  .actions((self) => ({
    setNum( value: number) {
      self.num = value;
    },
    collectSum() {
      return self.children.reduce((s, i) => {
        return s + i.num;
      }, 0);
    }
  }));

const Parent = types
  .model('Parent', {
    first: types.string,
    last: types.string,
    num1: types.number,
    num2: types.number,
    children: types.array(Child)
  })
  .views(self => ({
    get name() {
      return `${self.first} ${self.last}`;
    },
    get sum() {
      return self.num1 + self.num2;
    }
  }))
  .actions((self) => ({
    setNum1( value: number) {
      self.num1 = value;
    },
    setNum2( value: number) {
      self.num2 = value;
    },
    collectSum() {
      return self.children.reduce((s, i) => {
        return s + i.num;
      }, 0);
    },
    collectDeepSum() {
      return self.children.reduce((s, i) => {
        return s + i.collectSum();
      }, 0);
    }
  }));*/
// END: SIMPLE

// BEGIN: FAST

const GrandChild = types
  .model('GrandChild', {
    type: types.optional(types.enumeration(['X', 'Y', 'Z']), getGrandChildType),
    num: types.optional(types.number, () => getRandomArbitrary(0, 10))
  })
  .views(self => ({
    get parent(): Instance<typeof Child> {
      return getParent(self, 2);
    },
    get combo() {
      const parent = this.parent;
      const parentType = parent.type;
      const grandParent = parent.parent;
      const grandParentName = grandParent.name;

      return `${grandParentName} -> ${parentType} -> ${self.type}`;
    }
  }))
  .actions(() => ({
    setNum(this: any, value: number) {
      this.num = value;
    }
  }));

const Child = types
  .model('Child', {
    type: types.optional(types.enumeration(['A', 'B', 'C']), getChildType),
    num: types.optional(types.number, () => getRandomArbitrary(1, 100)),
    children: types.array(GrandChild)
  })
  .views(self => ({
    get parent(): Instance<typeof Parent> {
      return getParent(self, 2);
    },
    get numCopy() {
      return self.num;
    }
  }))
  .actions(() => ({
    setNum(this: any, value: number) {
      this.num = value;
    },
    collectSum(this: any) {
      return this.children.reduce((s, i) => {
        return s + i.num;
      }, 0);
    }
  }));

const Parent = types
  .model('Parent', {
    first: types.string,
    last: types.string,
    num1: types.number,
    num2: types.number,
    children: types.array(Child)
  })
  .views(self => ({
    get name() {
      return `${self.first} ${self.last}`;
    },
    get sum() {
      return self.num1 + self.num2;
    }
  }))
  .actions(() => ({
    setNum1(this: any, value: number) {
      this.num1 = value;
    },
    setNum2(this: any, value: number) {
      this.num2 = value;
    },
    collectSum(this: any) {
      return this.children.reduce((s, i) => {
        return s + i.num;
      }, 0);
    },
    collectDeepSum(this: any) {
      return this.children.reduce((s, i) => {
        return s + i.collectSum();
      }, 0);
    }
  }));

// END: FAST

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

/*const FastGrandChild = types
  .model('FastGrandChild', {
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
  .computeds({
    get parent() {
      return getParent(this, 2);
    },
    get combo() {
      const parent = this.parent;
      const parentType = parent.type;
      const grandParent = parent.parent;
      const grandParentName = grandParent.name;

      return `${grandParentName}+${parentType}+${this.type}`;
    }
  })
  .extend(self => {
    const actions = {
      setNum(value: number) {
        self.num = value;
      }
    };

    return {actions};
  });

const FastChild = types
  .model('FastChild', {
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
    children: types.array(FastGrandChild)
  })
  .computeds({
    get parent() {
      return getParent(this, 2);
    },
    get numCopy() {
      return this.num;
    }
  })
  .extend(self => {
    const actions = {
      setNum(value: number) {
        self.num = value;
      },
      collectSum() {
        return self.children.reduce((s, i) => {
          return s + i.num;
        }, 0);
      }
    };

    return {actions};
  });

const FastParent = types
  .model('FastParent', {
    first: types.string,
    last: types.string,
    num1: types.number,
    num2: types.number,
    children: types.array(FastChild)
  })
  .computeds({
    get name() {
      return `${this.first} + ${this.last}`;
    },
    get sum() {
      return this.num1 + this.num2;
    }
  })
  .extend(self => {
    const actions = {
      setNum1(value: number) {
        self.num1 = value;
      },
      setNum2(value: number) {
        self.num2 = value;
      },
      collectSum() {
        return self.children.reduce((s, i) => {
          return s + i.num;
        }, 0);
      },
      collectDeepSum() {
        return self.children.reduce((s, i) => {
          return s + i.collectSum();
        }, 0);
      }
    };

    return {actions};
  });*/

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

/*function CreateOneFastParent() {
  console.time('create one parent');
  const parent = FastParent.create(ParentSnapshotBase);
  console.timeEnd('create one parent');
  console.log('Parent:', parent);
  return parent;
}

function CreateFastParents(count = 10) {
  console.time(`create ${count} parents`);
  const parents = Array(count);
  for (let i = 0; i < count; i++) {
    parents[i] = FastParent.create(ParentSnapshotBase);
  }
  console.timeEnd(`create ${count} parents`);
  console.log('Parents:', parents);
  return parents;
}*/

/*const test = CreateOneParent();

onAction(test, a => console.log('onAction', a));
onSnapshot(test, s => console.log('onSnapshot', s));

test.setNum1(-1);
test.children[0].setNum(-2);
test.children[1].children[0].setNum(-3);*/

/*const ChildInMap = types.model('ChildInMap', {
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
example.secondArray.unshift(two)*/

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

(window as any).onAction = onAction;
(window as any).onSnapshot = onSnapshot;

export {CreateOneMobxParent, CreateMobxParents, CreateOneParent, CreateParents /*, CreateOneFastParent, CreateFastParents*/};

/*const a = FastParent.create({
  first: 'Foo1',
  last: 'Bar1',
  num1: 1,
  num2: 2,
  children: Array(100).fill({
    children: Array(10).fill({})
  })
});

const b = FastParent.create({
  first: 'Foo2',
  last: 'Bar2',
  num1: 1,
  num2: 2,
  children: Array(100).fill({
    children: Array(10).fill({})
  })
});

console.log('a.name', a.name);
console.log('b.name', b.name);*/

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

/*const Example = types
  .model('Example', { prop: types.string })
  .views((self: typeof Example.Type) => ({
    get upperProp(): string {
      return self.prop.toUpperCase();
    },
    get twiceUpperProp(): string {
      return self.upperProp + self.upperProp;
    }
  }))*/

/*const EMPTY_OBJECT = {};
const MOBX_SHALLOW = {deep: false};
export function doInstanceTest() {
  let results = [];
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    const instance = observable.object(
      {
        name: `Foo${i}`,
        surname: `Bar${i}`,
        get fullName() {
          return this.name + ' ' + this.surname;
        }
      },
      EMPTY_OBJECT,
      MOBX_SHALLOW
    );

    results.push(instance);
  }

  console.log('doProtoTest', performance.now() - start);
  return results;
}

export function doProtoTest() {
  let results = [];
  const start = performance.now();
  const Proto = {};
  // @ts-ignore
  computed(
    Proto,
    'fullName',
    {
      get() {
        return this.name + ' ' + this.surname;
      }
    },
    true
  );

  for (let i = 0; i < 10000; i++) {
    const instance = Object.create(Proto);
    // @ts-ignore
    extendObservable(instance, {name: `Foo${i}`, surname: `Bar${i}`}, EMPTY_OBJECT, MOBX_SHALLOW);
    results.push(instance);
  }
  console.log('doProtoTest', performance.now() - start);
  return results;
}*/
