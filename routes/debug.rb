class DebugController < SDN
  get '/' do
    File.read(File.join('views', 'tree.html'))
  end
end
