import React from 'react';
import ReactDOM from 'react-dom';

/*const hintProps: HintProps = {text: 'Some', pos: 'top', disableAnimations: false, useWrapper: false};
const hint = <Hint {...hintProps} />;*/

const items = new Array(150)
  .fill('')
  .map((v, i) => <input key={i} width={150}/>);

ReactDOM.render(React.createElement('div', {children: items}), document.getElementById('react-result-container'));
