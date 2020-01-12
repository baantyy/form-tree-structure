import React, { Component, useState, Fragment } from 'react';
const uuid4 = require('uuid4');

const init = (id, parentId) => {
    return {
        id: id || uuid4(),
        parentId, 
        title: '', 
        value: '',
        hasNested: false,
        nestedFieldIds: [],
    };
};

class Nested extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [init(0, 0)],
        };
    };

    addNew = (id, parentId) => {
        this.setState(prevState => ({
            data: [...prevState.data, ...[init(id, parentId || 0)]],
        }));
    };

    updateData = (type, { id, title, value, hasNested, newId }) => {
        if(type === 'text'){
            this.setState(prevState => ({
                data: prevState.data.map(item => {
                    if(id === item.id){
                        return {...item, ...{ title, value, hasNested }};
                    }else{
                        return item;
                    }
                }),
            }));
        }else if(type === 'checkbox'){
            this.setState(prevState => ({
                data: prevState.data.map(item => {
                    if(id === item.id){
                        return {...item, ...{
                            nestedFieldIds: newId ? [newId] : []
                        }};
                    }else{
                        return item;
                    }
                })
            }));
        }else if(type === 'addNew'){
            this.setState(prevState => ({
                data: prevState.data.map(item => {
                    if(id === item.id){
                        return {...item, ...{
                            nestedFieldIds: [...item.nestedFieldIds, ...[newId]]
                        }};
                    }else{
                        return item;
                    }
                })
            }));
        }
    };

    removeData = async (id, parentId) => {
        const data = await this.state.data.map(item => {
            if(item.id === parentId){
                return {...item, ...{
                    nestedFieldIds: item.nestedFieldIds.filter(i => i !== id)
                }};
            }else{
                return item;
            }
        });
        this.setState(() => ({
            data: data.filter(item => item.id !== id),
        }));
    };

    submitData = async () => {
        // const { data } = this.state;
        // let finalData = data;
        // const searchIndex = (id) => {
        //     return finalData.findIndex(item => item.nestedFieldIds.includes(id));
        // };
        // for(let i = data.length - 1; i >=  0; i--){
        //     const index = searchIndex(data[i].id);
        //     if(index > -1){
        //         if(finalData[index].hasOwnProperty('fields')){
        //             finalData[index]['fields'] = [...finalData[index]['fields'], ...[data[i]]];
        //         }else{
        //             finalData[index]['fields'] = [data[i]];
        //         }
        //     }
        // }
        // await data.forEach(async (item, index) => {
        //     const i = data.length - index - 1;
        //     const pos = await searchIndex(data[i].id);
        //     if(pos > -1){
        //         if(finalData[pos].hasOwnProperty('fields')){
        //             finalData[pos]['fields'] = [...finalData[pos]['fields'], ...[data[i]]];
        //         }else{
        //             finalData[pos]['fields'] = [data[i]];
        //         }
        //     }
        // })
        // console.log({ 
        //     data: finalData.filter(item => item.parentId === 0)
        // });
    };

    render() {
        const { data } = this.state;
        const parentData = data.filter(item => item.parentId === 0);
        return (
            <div className="nested">
                <div className="submit">
                    <button className="btn btn-success" 
                        onClick={() => { this.submitData() }}>Submit</button>
                </div>
                <button className="btn btn-primary" 
                    onClick={() => { this.addNew() }}>Add</button>
                {parentData.map(item => ( 
                    <Fragment key={item.id} >               
                        <Block 
                            data={data}
                            item={item}
                            updateData={this.updateData}
                            addNew={this.addNew}
                            removeData={this.removeData}
                        />
                    </Fragment>    
                ))}                
            </div>
        );
    };
};

const Block = props => {
    const { data, item, updateData, addNew, removeData } = props;
    let nestedFields = [];
    if(item.nestedFieldIds.length > 0){
        nestedFields = data.filter(field => item.nestedFieldIds.includes(field.id));
    }
    return (
        <div className="block">
            <Form 
                item={item} 
                updateData={updateData}
                addNew={addNew}
                removeData={removeData}
            />
            {nestedFields.map((field, index) => (
                <Fragment key={field.id}>
                    {index === 0 ? 
                        <button className="btn btn-primary" 
                            onClick={() => {
                                const newId = uuid4();
                                addNew(newId, item.id);
                                updateData('addNew', { id: item.id, newId });
                            }}>Add</button>
                    : ''
                    }
                    <Block 
                        data={data}
                        item={field} 
                        updateData={updateData}
                        addNew={addNew}
                        removeData={removeData}
                    />
                </Fragment>
            ))}
        </div>
    )
};

const Form = props => {
    const { item, updateData, addNew, removeData } = props;
    const [title, setTitle] = useState(item.title);
    const [value, setValue] = useState(item.value);
    const [hasNested, setHasNested] = useState(item.hasNested);

    const handleTitle = e => {
        const data = e.target.value;
        setTitle(data);
        updateData('text', { id: item.id, title: data, value, hasNested });
    };

    const handleValue = e => {
        const data = e.target.value;
        setValue(data);
        updateData('text', { id: item.id, title, value: data, hasNested });
    };

    const handleCheckbox = () => {
        const data = !hasNested;
        setHasNested(data);
        if(data){
            const newId = uuid4();
            addNew(newId, item.id);
            updateData('checkbox', { id: item.id, title, value, hasNested: data, newId });
        }else{
            updateData('checkbox', { id: item.id, title, value, hasNested: data });
        }
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
                    id={item.id} 
                    onChange={handleCheckbox}
                    checked={hasNested}
                    name="hasNested"
                    />
                <label className="form-check-label" 
                    htmlFor={item.id}>Has Nested</label>
            </div>
            <button className="btn btn-danger delete"
                    onClick={() => { removeData(item.id, item.parentId) }}
                > x </button>
        </div>
    );
};

export default Nested;
