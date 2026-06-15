import React from 'react'
import TimeLineImage from "../../../assets/Images/TimelineImage.png";
import Logo1 from "../../../assets/TimeLineLogo/Logo1.svg";
import Logo2 from "../../../assets/TimeLineLogo/Logo1.svg";
import Logo3 from "../../../assets/TimeLineLogo/Logo1.svg";
import Logo4 from "../../../assets/TimeLineLogo/Logo1.svg";
const timeline = [
    {
      Logo: Logo1,
      heading: "Leadership",
      Description: "Fully committed to the success company",
    },
    {
      Logo: Logo2,
      heading: "Responsibility",
      Description: "Students will always be our top priority",
    },
    {
      Logo: Logo3,
      heading: "Flexibility",
      Description: "The ability to switch is an important skills",
    },
    {
      Logo: Logo4,
      heading: "Solve the problem",
      Description: "Code your way to a solution",
    },
  ];

const TimelineSection = () => {
  return (
    <div>
        <div>
            <div className='flex flex-row gap-15 items-center '>
                {/* left box */}
                <div className='w-[45%] flex flex-col gap-5'>
                    {
                        timeline.map((element,index)=>{
                            return (
                                    <div className='flex flex-row gap-6 ' key={index}>
                                            {/* left box */}
                                            <div className='w-[50px] h-[50px] bg-white flex items-center'>
                                                <img src={element.Logo}/>
                                            </div>

                                            {/* right box */}
                                            <div>
                                                <h2 className='font-semibold text-[18px]'>{element.heading}</h2>
                                                <p className='text-base'>{element.Description}</p>
                                            </div>
                                    </div>
                            )
                        })
                    }
                </div>
                
               
                <div className="relative w-fit h-fit shadow-blue-200 shadow-[0px_0px_30px_0px]">
                    <img
                        src={TimeLineImage}
                        alt="timelineImage"
                        className="shadow-white shadow-[20px_20px_0px_0px] object-cover h-[400px] lg:h-fit"
                    />

                     {/* green box */}
                    <div className='absolute bg-caribbeangreen-700 flex flex-row text-white uppercase py-7
                    left-[50%] translate-x-[-50%] translate-y-[-50%]'>
                        <div className='flex flex-row gap-5 items-center border-r border-carbeangreen-300 px-7'>
                            <p className='text-3xl font-bold'>10</p>
                            <p className='text-caribbeangreen-300 text-sm'>Years of Experience</p>
                           
                        </div>
                        <div className='flex gap-5 items-center px-7'>
                             <p className='text-3xl font-bold'>25</p>
                            <p className='text-caribbeangreen-300 text-sm'>Types of Courses</p>
                        </div>
                    </div>
                    
                    
                </div>   

            </div>
        </div>
    </div>
  )
}

export default TimelineSection;
