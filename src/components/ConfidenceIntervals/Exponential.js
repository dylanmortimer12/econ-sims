import React from 'react';
import Collapsable from '../Collapsable.js';
import ChartContainer from './ChartContainer.js';
import ToggleStandard from '../ToggleStandard.js';
import SampleMeanChart from './SampleMeanChart.js'
import SampleAreaCLT from './SampleAreaCLT.js'
import SampleMeanSimulator from '../SampleMeanSimulator.js'
import math from 'mathjs';
import { Alert, Button, Col, Label, Input, Row, Table } from 'reactstrap';

class Exponential extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            numberResamples : {
                "Normal": 0,
                "Uniform": 0,
                "Exponential": 0,
                "Chi-Squared": 0,
                "Mystery": 0
            },
            resampleSize : {
                "Normal": 0,
                "Uniform": 0,
                "Exponential": 0,
                "Chi-Squared": 0,
                "Mystery": 0
            },
            sampleMean: [],
            sampled: [],
            mainSampleSize: this.props.mainSampleSize,
            popArray: [],
            standardNormal : 0,
            sampleSize : 1,
            disableSample : false,
            popType: 'Exponential',
            confidence: ''
        }
        this.changeStage = this.changeStage.bind(this);
    }

    changeStage(stage) {
        this.setState({stage: stage});
    }

    generateExponential(){
        const LAMBDA = 1/64;

        const sampleSize = this.state.mainSampleSize;
        const popArray = this.state.popArray ? this.state.popArray.slice() : []

        let dict = Array(sampleSize).fill(-1); 

        for (let i = 0; i < sampleSize; i++){
            const val = -Math.log(Math.random()) / LAMBDA

            if (dict[Math.round(val * 10)]){
                dict[Math.round(val * 10)] += 1;
            } else {
                dict[Math.round(val * 10)] = 1;
            }
        }

        for (const point in dict) {
            if (point !== -1) {
                for (let count = 1; count < dict[point] + 2; count++) {
                    popArray.push([point/10, count]);
                }
            }
        }
        popArray.sort(() => Math.random() - 0.5);
        popArray.sort((a,b) => b[1] - a[1]);
        this.setState({
            popMean: math.mean(popArray.map(p => p[0]))
        })
        return popArray;

  
    }

    sample(size, popArray) {
        const sampled = []
        
        while (sampled.length < size){
            // index to sample ?
            const r = Math.round(Math.random() * (popArray.length - 1))
            let shouldSample = true;
            for (let i = 0; i < sampled.length; i++){
                if (sampled[i][0] === r) {
                    shouldSample = false;
                }
            }
            if (shouldSample) {
                // only pushes if shouldSample is true
                sampled.push(popArray[r]);
            }
        }

        return { pop: sampled, mue: Math.round(math.mean(sampled.map(p => p[0])) * 100)/100, sd: math.std(sampled.map(p => p[0])) };
    }

    updateSampleMeansFromArray(means){
        let sampleMeans = this.state.sampleMean;
        const roundedMeans = means;
        sampleMeans = sampleMeans.concat(roundedMeans);
        this.setState({calculable: false,
            sampleMean: sampleMeans
        })
    }

    componentDidUpdate() {
        if (this.state.popArray.length <= 0 && this.state.stage === 1) {
            this.setState({
                popArray: this.generateExponential()
            })
        }
    }

    componentDidMount() {
        this.setState({
            stage: 0
        })
    }

    render() {
        return (
            <div>
                <Collapsable
                    stage={[0, 1, 2]}
                    changeStage={this.changeStage}
                    parentStage={this.state.stage}
                >
                    <div>
                        <h1 
                        // style={{ display: 'inline' }}
                        >
                            Introduction
                        </h1>
                         
                    </div>
                    
                    <p> The purpose of this simulation is to show that the formula we develop in class for a “reasonable margin of error” around the sample mean works. About 95 out of 100 intervals we generate using the formula for a 95% confidence interval will contain the true population mean 𝜇. And, what is cooler, this formula will work regardless of the underlying population distribution.</p>

                    <Button outline
                        style={{ marginBottom: '2em' }}
                        onClick={
                            () => {
                                this.changeStage(1);
                            }
                        }
                    >
                        Continue
                    </Button>

                    <div>
                        {
                            this.state.stage >= 1 ?
                                <div>
                                    <div>
                                        <Row>

                                        <Col
                                            lg="6">

                                            <ChartContainer 
                                                popArray={this.state.popArray}
                                                popMean={this.state.popMean}
                                                sampled={this.state.sampled}
                                                popType={'Exponential'}
                                                mainSampleSize={this.state.mainSampleSize}
                                            />
                                        </Col>

                                        <Col
                                            lg="6">
                                            <SampleMeanChart
                                                numberResamples={this.state.numberResamples} 
                                                resampleSize={this.state.resampleSize[this.state.popType]} 
                                                mean={this.state.popMean} 
                                                sd={this.state.popArray.length > 0 ? math.std(this.state.popArray) : 1}
                                                normalized={this.state.standardNormal} 
                                                sampleSize={this.state.sampleSize} 
                                                type={this.state.popType} 
                                                normal={this.state.standardNormal} 
                                                sampleMeans={this.state.sampleMean}
                                                confidence={this.state.confidence}
                                                />
                                        </Col>
                                                </Row>
                                                {/* <Row>
                                                    <Col>
                                                        <Label className="text-muted" for="confidence">Pick a confidence level</Label>
                                                            <Input
                                                                id="confidence"
                                                                type="number"
                                                                min="1"
                                                                max="1000"
                                                                step="100"
                                                                value={this.state.confidence}
                                                                onChange={(event) => {
                                                                    this.setState({
                                                                        confidence: event.target.value
                                                                    })
                                                                }}
                                                            />
                                                    </Col>
                                                </Row> */}
                                        {
                                            
                                        <span>
                                        <Row>
                                            
                                            <Col lg="6">
                                                <Alert color='light'>
                                                    <p>Try drawing some samples and calculating means </p>
                                                    <SampleAreaCLT 
                                                        disabled={this.state.disableSample} 
                                                        redraw={() => 
                                                            {}
                                                        }
                                                        sample={(size) => {
                                                            const sampleObject = this.sample(size, this.state.popArray);
                                                            
                                                            this.setState({
                                                                sampled: sampleObject.pop
                                                            });
                                                            return sampleObject;
                                                            
                                                        }}
                                                        mean={this.state.popMean}
                                                        popArray={this.state.popArray}
                                                        popType={this.state.popType}
                                                        setmean={(size, mue, sd, lc, uc, label) => {
                                                            const means = this.state.sampleMean;
                                                            means.push([size, mue, sd, lc, uc, label]);
                                                            this.setState({sampleMean: means});
                                                        }}
                                                        />
                                                </Alert>
                                                <Alert color='light' className="Center">
                                                    <Alert color="primary" style={{width: "50%", margin: 'auto'}}>
                                                        <p> Simulate drawing many many samples </p>
                                                    </Alert>
                                                    <SampleMeanSimulator 
                                                        style={{margin: 'auto'}}
                                                        clear={() => {
                                                            this.setState({
                                                                calculable: false, 
                                                                sampleMean: []
                                                            })}
                                                        }
                                                        population={this.state.popArray}
                                                        popType={this.state.popType}
                                                        mean={this.state.popMean}
                                                        sample={(means) => {
                                                            console.log('means', means);
                                                            this.updateSampleMeansFromArray(means);
                                                            this.setState({disableSample : true});
                                                        }}
                                                    />
                                                </Alert>
                                            </Col>
                                            <Col lg="6">
                                                <Table hover className="PopTable">
                                                    <thead>
                                                        <tr>
                                                            <th>Sample</th>
                                                            <th>Size</th>
                                                            <th>Mean</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                    {this.state.sampleMean && this.state.sampleMean.map( (mean, index) => (
                                                        <tr
                                                            style={ mean[5] === 'no' ? {backgroundColor: "rgba(161, 23, 23, 0.233)"} : {backgroundColor: "rgba(23, 161, 80, 0.233)"}}>
                                                            <td>{index + 1}</td>
                                                            <td>{mean[0]}</td>
                                                            <td>{Math.round(mean[1] * 10) / 10}</td>
                                                            
                                                        </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                </Col>
                                            </Row>
                                            {
                                                this.state.sampleMean.length > 0 &&

                                                <Row lg="12" >
                                                    <Alert color="info" style={{margin:'auto'}}>
                                                        <p>
                                                            {this.state.sampleMean.filter(point => point[5] === 'no').length} intervals did not contain the true mean <br></br>
                                                            {this.state.sampleMean.filter(point => point[5] === 'yes').length} did
                                                        </p>

                                                    </Alert>
                                                </Row>
                                            }
                                        </span>
                                        }
                                    </div>
                                </div>
                            :
                                <div></div>
                            }
                    </div>
                </Collapsable>
            </div>
        )
    }
}

export default Exponential;