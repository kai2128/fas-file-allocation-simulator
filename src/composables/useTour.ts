import Shepherd from 'shepherd.js'

export function useTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      scrollTo: true,
      modalOverlayOpeningPadding: 10,
      modalOverlayOpeningRadius: 5,
    },
  })

  const defaultButtons = (nextActions?: Function, previousActions?: Function) => [
    {
      text: 'Close',
      action: tour.complete,
    },
    {
      text: 'Back',
      action: () => {
        !!previousActions && previousActions()
        tour.back()
      },
    },
    {
      text: 'Next',
      action: () => {
        !!nextActions && nextActions()
        tour.next()
      },
    },
  ]

  tour.addStep({
    title: 'FAS guides',
    text: 'This tour guide you will introduce you in using the application. (You can press left or right arrow to go to next or previous step)',
    buttons: [
      {
        text: 'Start',
        action: tour.next,
      },
      {
        text: 'Close',
        action: tour.complete,
      },
    ],
  })

  // #region Disk options
  tour.addStep({
    title: 'Disk options',
    text: 'This section is used to set the disk options (file system and disk size).',
    attachTo: {
      element: '[data-tour="disk-input"]',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'File system can be chosen here.',
    attachTo: {
      element: '[data-tour="disk-input"]>:nth-child(1)',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'Disk size is set here.',
    attachTo: {
      element: '[data-tour="disk-input"]>:nth-child(2)',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'Click on the "Format" button to format the disk with the specified options.',
    attachTo: {
      element: '[data-tour="disk-input"]>:nth-child(3)',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })
  // #endregion

  // #region Input
  tour.addStep({
    title: 'Input sections',
    text: 'Here is where you can set input and actions (create, delete, append, write and read files).',
    attachTo: {
      element: '[data-tour="file-input"]',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'File name is typed here.',
    attachTo: {
      element: '[data-tour="file-input"] label:nth-child(1)',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'File action is set here (create, delete, append, write or read).',
    attachTo: {
      element: '[data-tour="file-input"] label:nth-child(2)',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'File size is set here.',
    attachTo: {
      element: '[data-tour="file-input"] label:nth-child(3)',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'Press on the execute button to start the action, when animation is runing, this button is replaced with "Skip" and "Cancel" button. <br> The "Skip" button skips current animation and completes the action. <br> The "Cancel" buttons stops current actions and revert back to previous states.',
    attachTo: {
      element: '[data-tour="file-input-button"]',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'Press on this button to generate some random input.',
    attachTo: {
      element: '[data-tour="file-input"] button:nth-child(1)',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })
  // #endregion

  // #region Files
  tour.addStep({
    title: 'Files section',
    text: 'This section shows file created.',
    attachTo: {
      element: '[data-tour="files"]',
      on: 'right',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: `After a file has been created, it details is shown in this table. <br>
           Each file can be selected which will set its name in the file input name field.`,
    attachTo: {
      element: '[data-tour="files-table"]',
      on: 'right',
    },
    buttons: defaultButtons(),
  })
  // # endregion

  // #region File Allocation Table
  tour.addStep({
    title: 'File Allocation Table',
    text: 'Here is the file allocation table (data structure used by FAT file system in mapping file into clusters), for more information please refer to the documentation.',
    attachTo: {
      element: '[data-tour="fat-table"]',
      on: 'bottom',
    },
    buttons: defaultButtons(),
  })
  // #endregion
  // #region Volume Blocks
  tour.addStep({
    title: 'Volume Blocks',
    text: 'This section represent disk unit using small block and their status can be identified base on their colour.',
    attachTo: {
      element: '[data-tour="volume-blocks"]',
      on: 'left',
    },
    buttons: defaultButtons(),
  })
  // #endregion

  // #region Actions
  tour.addStep({
    title: 'Action',
    text: 'This section showns current file actions steps by steps.',
    attachTo: {
      element: '[data-tour="action"]',
      on: 'top',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: `This button pause the current steps, you can either resume it or go to next step manually. <br>
           After action is paused, you can go to next step by pressing the "Forward" button or pressing "N" key on the keyboard. <br>
           To play or pause the action, press the icon button or "P" key on the keyboard.`,
    attachTo: {
      element: '[data-tour="action-pause-button"]',
      on: 'top',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'The interval of each step can be set here (speed between each steps).',
    attachTo: {
      element: '[data-tour="action-interval"]',
      on: 'top',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'By pressing this button will disable animations and the action will be completed instantly, pressing on this button again to enable animations. (Animation cannot be disable when animation is running)',
    attachTo: {
      element: '[data-tour="action-disable-button"]',
      on: 'top',
    },
    buttons: defaultButtons(),
  })
  // #endregion

  // #region Log
  tour.addStep({
    title: 'Log',
    text: 'This section display details log of the simulator such as files creation, disk format information, etc.',
    attachTo: {
      element: '[data-tour="log"]',
      on: 'top',
    },
    buttons: defaultButtons(),
  })

  tour.addStep({
    text: 'Pressing on this button will clear all previous logs.',
    attachTo: {
      element: '[data-tour="log"] button',
      on: 'top',
    },
    buttons: defaultButtons(),
  })
  // #endregion

  // #region Disk Info
  tour.addStep({
    title: 'Disk Info',
    text: 'This section shows the disk information such as total size, free space, used space, etc. The disk usage graph is also shown here.',
    attachTo: {
      element: '[data-tour="disk-info"]',
      on: 'top',
    },
    buttons: defaultButtons(),
  })
  // #endregion

  return { tour, start: tour.start }
}

