import React, { Component, useState, Fragment } from 'react';
const uuid4 = require('uuid4');

const init = level => {
    return {
        title: '', 
        value: '',
        hasNested: false,
        nestedFields: [],
        level
    };
};

class Nested extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [init(0)],
        };
    };

    addNew = (val, inx) => {
        if(inx !== undefined) {
            let leveles = val.split('_').map(e => parseInt(e));
            leveles.splice(-1);
            let data = this.state.data;
            let vali = (dataObj, i, leveles) => {
                if(leveles.length === ( i + 1 )){
                    let vals = init(i);
                    vals['nested_level'] = val + (inx + 1);
                    dataObj[leveles[i]].nestedFields.push(vals);
                }else {
                    dataObj = vali(dataObj[leveles[i]].nestedFields, i+1, leveles);
                }                
                return dataObj;
            }
            vali(data, 0, leveles);
            this.setState({data})
            return;
        }
        this.setState(prevData => ({
            data: [...prevData.data, ...[init(val)]]
        }));
    };

    updateData = (title, value, hasNested, nestedFields, index, level, didType) => {
        if (typeof(level) === 'number') {
            this.setState(prevState => ({
                data: prevState.data.map((item, pos) => {
                    if (pos === index){
                        return {
                            title, 
                            value, 
                            hasNested, 
                            nestedFields: hasNested ? nestedFields : [], 
                            level
                        };
                    }else{
                        return item;
                    }
                }),
            }));
        } else if (level) {
            let leveles = level.split('_').map(e => parseInt(e));
            let data = this.state.data;
            let vali = (dataObj, i, leveles) => {
                if(leveles.length === i){
                    let vals = init(i);
                    vals['nested_level'] = level + '_' + 0;
                    dataObj.push(vals);                    
                } else{
                    if(!hasNested  && leveles.length === ( i + 1 )) {
                        dataObj[leveles[i]].nestedFields = [];
                    }
                    if(didType && leveles.length === ( i + 1 ) && (title !== '' || value !== '')){
                        dataObj[leveles[i]]['title'] = title;
                        dataObj[leveles[i]]['value'] = value;
                    }else {
                        dataObj = vali(dataObj[leveles[i]].nestedFields, i+1, leveles);
                    }
                }
                return dataObj;
            }
            vali(data, 0, leveles);
            this.setState({data})
        }
    };

    render() {
        const { data } = this.state;
        console.log(data);
        return (
            <div className="nested">
                <button className="btn btn-primary" 
                    onClick={() => { this.addNew(data.length) }}>Add</button>
                {data.map((item, index) => (                    
                    <Block key={index} 
                        index={index}
                        item={item}
                        updateData={this.updateData}
                        level={index}
                        addNew={this.addNew}
                        />
                ))}                
            </div>
        );
    };
};

const Block = props => {
    const { item, index, updateData, level, nested_level, addNew } = props;
    return (
        <div className="block">
            <Form item={item} 
                index={index} 
                updateData={updateData}
                level={level}
                nested_level={nested_level || level}
                />
            {item.nestedFields.map((item1, index1) => (
                <Fragment key={index1}>
                    {index1 === 0 ?
                        <button className="btn btn-primary" 
                            onClick={() => { addNew((nested_level || level) +'_', index1) }}>Add</button> : ''
                    }
                    <Block item={item1} 
                            index={index}
                            updateData={updateData}
                            level={level + 1}
                            nested_level={(nested_level || level) +'_'+ index1}
                            addNew={addNew}
                            />
                </Fragment>
            ))}
        </div>
    )
};

const Form = props => {
    const { item, index, updateData, level, nested_level } = props;
    const [title, setTitle] = useState(item.title);
    const [value, setValue] = useState(item.value);
    const [hasNested, setHasNested] = useState(item.hasNested);
    const [nestedFields, setNestedFields] = useState(item.nestedFields);
    const [id] = useState(uuid4());

    const handleTitle = e => {
        const data = e.target.value;
        setTitle(data);
        updateData(data, value, hasNested, nestedFields, index, nested_level, true);
    };

    const handleValue = e => {
        const data = e.target.value;
        setValue(data);
        updateData(title, data, hasNested, nestedFields, index, nested_level, true);
    };

    const handleCheckbox = () => {
        const data = !hasNested;
        setHasNested(data);
        let lastIndex = typeof(nested_level) === 'number' ? level : nested_level.split('_').splice(-1)[0];
        lastIndex = parseInt(lastIndex);
        setNestedFields(init(lastIndex + 1));
        updateData(title, value, data, [init(lastIndex + 1)], index, nested_level);
        console.log({ title, value, data, init: [init(lastIndex + 1)], index, nested_level })
    };

    return (
        <div className="form">
            <input type="text" 
                className="form-control mb-2" 
                placeholder="Title" 
                name="title"
                value={title}
                onChange={handleTitle} 
            />
            <input type="text" 
                className="form-control mb-1" 
                placeholder="Value" 
                name="value"
                value={value}
                onChange={handleValue} 
            />
            <div className="form-group form-check">
                <input type="checkbox" 
                    className="form-check-input" 
                    id={id} 
                    onChange={handleCheckbox}
                    checked={hasNested}
                    name="hasNested"
                    />
                <label className="form-check-label" 
                    htmlFor={id}>Has Nested</label>
            </div>
        </div>
    );
};

export default Nested;
